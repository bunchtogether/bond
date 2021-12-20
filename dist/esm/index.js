import EventEmitter from 'events';
import SimplePeer from 'simple-peer';
import PQueue from 'p-queue';
import { SIGNAL, START_SESSION, LEAVE_SESSION, RESPONSE } from './constants';
import { RequestError, RequestTimeoutError } from './errors';

const getSocketMap = values => {
  if (typeof values === 'undefined') {
    return new Map();
  }

  return new Map(values.map(x => {
    const socketHash = `${x[0]}:${x[1]}`;
    return [socketHash, {
      socketHash,
      socketId: x[0],
      serverId: x[1],
      userId: x[2],
      clientId: x[3],
      sessionId: x[4]
    }];
  }));
};

const getPeerIds = values => {
  if (typeof values === 'undefined') {
    return new Set();
  }

  return new Set(values.map(x => x[2]));
};

const getSessionMap = socketMap => {
  const map = new Map();

  for (const socket of socketMap.values()) {
    const {
      socketHash,
      sessionId
    } = socket;
    const sessionSocketMap = map.get(sessionId);

    if (typeof sessionSocketMap === 'undefined') {
      map.set(sessionId, new Map([[socketHash, socket]]));
    } else {
      sessionSocketMap.set(socketHash, socket);
    }
  }

  return map;
};

export class Bond extends EventEmitter {
  constructor(braidClient, roomId, userId, options = {}) {
    super();
    this.active = true;
    this.clientId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    this.roomId = roomId;
    this.userId = userId;
    const name = `signal/${this.roomId}`;
    this.name = name;
    this.publishName = `signal/${this.roomId}/${this.clientId.toString(36)}`;
    this.braidClient = braidClient;
    this.ready = this.init();
    this.logger = options.logger || braidClient.logger;
    this.wrtc = options.wrtc;
    this.socketMap = new Map();
    this.userIds = new Set();
    this.peerMap = new Map();
    this.queueMap = new Map();
    this.sessionMap = new Map();
    this.requestCallbackMap = new Map();
    this.signalQueueMap = new Map();
    this.peerDisconnectTimeouts = new Map();

    this.handleSet = (key, values) => {
      if (key !== name) {
        return;
      }

      this.active = true;
      const oldSocketMap = this.socketMap;
      const newSocketMap = getSocketMap(values);
      const oldUserIds = this.userIds;
      const newUserIds = getPeerIds(values);
      const oldSessionMap = this.sessionMap;
      const newSessionMap = getSessionMap(newSocketMap);
      this.userIds = newUserIds;
      this.socketMap = newSocketMap;
      this.sessionMap = newSessionMap;

      for (const [socketHash, socketData] of oldSocketMap) {
        if (!newSocketMap.has(socketHash)) {
          this.emit('socketLeave', socketData);
        }
      }

      for (const [socketHash, socketData] of newSocketMap) {
        if (!oldSocketMap.has(socketHash)) {
          this.emit('socketJoin', socketData);
        }
      }

      for (const peerUserId of oldUserIds) {
        if (!newUserIds.has(peerUserId)) {
          this.emit('leave', peerUserId);
        }
      }

      for (const peerUserId of newUserIds) {
        if (!oldUserIds.has(peerUserId)) {
          this.emit('join', peerUserId);
        }
      }

      for (const [sessionId, oldSessionSocketMap] of oldSessionMap) {
        const newSessionSocketMap = newSessionMap.get(sessionId);

        if (typeof newSessionSocketMap === 'undefined') {
          for (const socketData of oldSessionSocketMap.values()) {
            this.emit('sessionLeave', socketData);
          }
        } else {
          for (const [socketHash, socketData] of oldSessionSocketMap) {
            if (!newSessionSocketMap.has(socketHash)) {
              this.emit('sessionLeave', socketData);
            }
          }
        }
      }

      for (const [sessionId, newSessionSocketMap] of newSessionMap) {
        const oldSessionSocketMap = oldSessionMap.get(sessionId);

        if (typeof oldSessionSocketMap === 'undefined') {
          for (const socketData of newSessionSocketMap.values()) {
            this.emit('sessionJoin', socketData);
          }
        } else {
          for (const [socketHash, socketData] of newSessionSocketMap) {
            if (!oldSessionSocketMap.has(socketHash)) {
              this.emit('sessionJoin', socketData);
            }
          }
        }
      }
    };

    this.braidClient.data.addListener('set', this.handleSet);
    this.addListener('socketJoin', socketData => {
      const {
        clientId
      } = socketData;

      if (this.peerDisconnectTimeouts.has(clientId)) {
        this.logger.info(`Clearing client ${clientId} disconnect timeout after socket join`);
        clearTimeout(this.peerDisconnectTimeouts.get(clientId));
        this.peerDisconnectTimeouts.delete(clientId);
      }

      this.addToQueue(clientId, () => this.connectToPeer(socketData));
    });
    this.addListener('socketLeave', socketData => {
      const {
        clientId
      } = socketData;
      clearTimeout(this.peerDisconnectTimeouts.get(clientId));

      if (this.active) {
        this.peerDisconnectTimeouts.set(clientId, setTimeout(() => {
          this.peerDisconnectTimeouts.delete(clientId);
          this.addToQueue(clientId, () => this.disconnectFromPeer(socketData));
        }, 15000));
      } else {
        this.addToQueue(clientId, () => this.disconnectFromPeer(socketData));
      }
    });
    this.braidClient.addListener('close', () => {
      const oldSocketData = [...this.socketMap.values()];
      const oldUserIds = [...this.userIds];
      this.socketMap.clear();
      this.userIds.clear();

      for (const socketData of oldSocketData) {
        this.emit('socketLeave', socketData);
      }

      for (const oldUserId of oldUserIds) {
        this.emit('leave', oldUserId);
      }
    });
    this.braidClient.addListener('reconnect', isReconnecting => {
      if (!isReconnecting) {
        return;
      }

      const startedSessionId = this.startedSessionId;

      const handleInitialized = () => {
        if (typeof startedSessionId === 'string') {
          this.logger.info(`Restarting session ${startedSessionId}`);
          this.startSession(startedSessionId).catch(error => {
            this.logger.error(`Unable to restart session ${startedSessionId} after reconnect`);
            this.logger.errorStack(error);
          });
        }

        this.braidClient.removeListener('initialized', handleInitialized);
        this.braidClient.removeListener('close', handleClose);
        this.braidClient.removeListener('error', handleError);
      };

      const handleClose = () => {
        this.braidClient.removeListener('initialized', handleInitialized);
        this.braidClient.removeListener('close', handleClose);
        this.braidClient.removeListener('error', handleError);
      };

      const handleError = error => {
        if (typeof startedSessionId === 'string') {
          this.logger.error(`Unable to restart session ${startedSessionId} after reconnect`);
          this.logger.errorStack(error);
        }

        this.braidClient.removeListener('initialized', handleInitialized);
        this.braidClient.removeListener('close', handleClose);
        this.braidClient.removeListener('error', handleError);
      };

      this.braidClient.addListener('initialized', handleInitialized);
      this.braidClient.addListener('close', handleClose);
      this.braidClient.addListener('error', handleError);
    });
  }

  async init() {
    const promise = new Promise((resolve, reject) => {
      const handleClose = () => {
        this.removeListener('close', handleClose);
        this.braidClient.data.removeListener('set', handleValue);
        this.braidClient.removeListener('error', handleError);
        reject(new Error('Closed before initialization completed'));
      };

      const handleValue = (key, value) => {
        if (key !== this.name) {
          return;
        }

        if (typeof value === 'undefined') {
          return;
        }

        this.removeListener('close', handleClose);
        this.braidClient.data.removeListener('set', handleValue);
        this.braidClient.removeListener('error', handleError);
        resolve();
      };

      const handleError = error => {
        this.removeListener('close', handleClose);
        this.braidClient.data.removeListener('set', handleValue);
        this.braidClient.removeListener('error', handleError);
        reject(error);
      };

      this.addListener('close', handleClose);
      this.braidClient.data.addListener('set', handleValue);
      this.braidClient.addListener('error', handleError);
      handleValue(this.name, this.braidClient.data.get(this.name));
    });

    try {
      await Promise.all([this.braidClient.subscribe(this.name), this.braidClient.addServerEventListener(this.name, this.handleMessage.bind(this))]);
      await promise;
      await this.braidClient.startPublishing(this.publishName);
    } catch (error) {
      this.braidClient.logger.error(`Unable to join ${this.roomId}`);
      throw error;
    }
  }

  addToQueue(queueId, func) {
    const queue = this.queueMap.get(queueId);

    if (typeof queue !== 'undefined') {
      return queue.add(func);
    }

    const newQueue = new PQueue({
      concurrency: 1
    });
    const promise = newQueue.add(func);
    this.queueMap.set(queueId, newQueue);
    newQueue.on('idle', () => {
      this.queueMap.delete(queueId);
    });
    return promise;
  }

  async publish(type, value, timeoutDuration = 5000) {
    await this.ready;
    const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.requestCallbackMap.delete(requestId);
        reject(new RequestTimeoutError(`${type} requested timed out after ${timeoutDuration}ms`));
      }, timeoutDuration);

      const handleResponse = (success, code, text) => {
        this.requestCallbackMap.delete(requestId);
        clearTimeout(timeout);

        if (success) {
          resolve({
            code,
            text
          });
          return;
        }

        reject(new RequestError(text, code));
      };

      this.requestCallbackMap.set(requestId, handleResponse);
      this.braidClient.publish(this.publishName, {
        requestId,
        type,
        value
      });
    });
  }

  async connectToPeer({
    userId,
    serverId,
    socketId,
    clientId,
    socketHash
  }) {
    const existingPeer = this.peerMap.get(clientId);
    const peer = existingPeer || new SimplePeer({
      initiator: userId > this.userId,
      wrtc: this.wrtc
    });
    this.peerMap.set(clientId, peer);

    if (peer.connected) {
      peer.emit('peerReconnect');

      const handlePeerClose = () => {
        this.logger.info(`Peer ${socketHash} disconnected`);
        peer.removeListener('error', handlePeerError);
        peer.removeListener('close', handlePeerClose);
        peer.removeListener('peerReconnect', handlePeerReconnect);
        this.emit('disconnect', {
          userId,
          serverId,
          socketId,
          peer
        });
      };

      const handlePeerError = error => {
        this.logger.error(`Peer ${socketHash} error`);
        this.logger.errorStack(error);
        this.emit('peerError', {
          error,
          userId,
          serverId,
          socketId,
          peer
        });
      };

      const handlePeerReconnect = () => {
        this.logger.info(`Peer ${socketHash} reconnected`);
        peer.removeListener('error', handlePeerError);
        peer.removeListener('close', handlePeerClose);
        peer.removeListener('peerReconnect', handlePeerReconnect);
      };

      peer.addListener('close', handlePeerClose);
      peer.addListener('error', handlePeerError);
      peer.addListener('peerReconnect', handlePeerReconnect);
      this.emit('connect', {
        userId,
        clientId,
        serverId,
        socketId,
        peer
      });
      return;
    }

    await new Promise(resolve => {
      const timeout = setTimeout(() => {
        peer.removeListener('error', handleError);
        peer.removeListener('connect', handleConnect);
        peer.removeListener('signal', handleSignal);
        this.removeListener('close', handleClose);
        this.removeListener('socketLeave', handleSocketLeave);
        resolve();
      }, 5000);

      const handleConnect = () => {
        clearTimeout(timeout);
        peer.removeListener('error', handleError);
        peer.removeListener('connect', handleConnect);
        peer.removeListener('signal', handleSignal);
        this.removeListener('close', handleClose);
        this.removeListener('socketLeave', handleSocketLeave);

        const handlePeerClose = () => {
          this.logger.info(`Peer ${socketHash} disconnected`);
          peer.removeListener('error', handlePeerError);
          peer.removeListener('close', handlePeerClose);
          peer.removeListener('peerReconnect', handlePeerReconnect);
          this.emit('disconnect', {
            userId,
            serverId,
            socketId,
            peer
          });
        };

        const handlePeerError = error => {
          this.logger.error(`Peer ${socketHash} error`);
          this.logger.errorStack(error);
          this.emit('peerError', {
            error,
            userId,
            serverId,
            socketId,
            peer
          });
        };

        const handlePeerReconnect = () => {
          this.logger.info(`Peer ${socketHash} reconnected`);
          peer.removeListener('error', handlePeerError);
          peer.removeListener('close', handlePeerClose);
          peer.removeListener('peerReconnect', handlePeerReconnect);
        };

        peer.addListener('close', handlePeerClose);
        peer.addListener('error', handlePeerError);
        peer.addListener('peerReconnect', handlePeerReconnect);
        this.emit('connect', {
          userId,
          clientId,
          serverId,
          socketId,
          peer
        });
        resolve();
      };

      const handleSignal = async data => {
        try {
          await this.publish(SIGNAL, {
            serverId,
            socketId,
            data
          });
        } catch (error) {
          this.logger.error(`Unable to signal ${socketHash}`);
          this.logger.errorStack(error);
        }
      };

      const handleClose = () => {
        clearTimeout(timeout);
        peer.removeListener('error', handleError);
        peer.removeListener('connect', handleConnect);
        peer.removeListener('signal', handleSignal);
        this.removeListener('close', handleClose);
        this.removeListener('socketLeave', handleSocketLeave);
        resolve();
      };

      const handleError = error => {
        clearTimeout(timeout);
        peer.removeListener('error', handleError);
        peer.removeListener('connect', handleConnect);
        peer.removeListener('signal', handleSignal);
        this.removeListener('close', handleClose);
        this.removeListener('socketLeave', handleSocketLeave);
        this.logger.error(`Error connecting to ${userId}`);
        this.logger.errorStack(error);
        this.emit('error', error);
        resolve();
      };

      const handleSocketLeave = ({
        socketHash: oldSocketHash
      }) => {
        if (socketHash !== oldSocketHash) {
          return;
        }

        clearTimeout(timeout);
        peer.removeListener('error', handleError);
        peer.removeListener('connect', handleConnect);
        peer.removeListener('signal', handleSignal);
        this.removeListener('close', handleClose);
        this.removeListener('socketLeave', handleSocketLeave);
        this.logger.warn(`Unable to connect to ${userId}, socket closed before connection was completed`);
        resolve();
      };

      peer.addListener('error', handleError);
      peer.addListener('connect', handleConnect);
      peer.addListener('signal', handleSignal);
      this.addListener('close', handleClose);
      this.addListener('socketLeave', handleSocketLeave);
      const signalQueue = this.signalQueueMap.get(clientId);

      if (Array.isArray(signalQueue)) {
        while (signalQueue.length > 0) {
          const data = signalQueue.shift();
          peer.signal(data);
        }
      }
    });
  }

  async disconnectFromPeer({
    clientId
  }) {
    const peer = this.peerMap.get(clientId);

    if (typeof peer === 'undefined') {
      return;
    }

    peer.destroy();
    this.peerMap.delete(clientId);
  }

  async onIdle() {
    while (this.queueMap.size > 0) {
      for (const queue of this.queueMap.values()) {
        await queue.onIdle();
      } // $FlowFixMe


      await new Promise(resolve => queueMicrotask(resolve));
    }
  }

  async startSession(sessionId) {
    await this.publish(START_SESSION, {
      sessionId
    });
    this.startedSessionId = sessionId;
  }

  async leaveSession() {
    await this.publish(LEAVE_SESSION, {});
    delete this.startedSessionId;
  }

  handleMessage(message) {
    if (typeof message !== 'object') {
      this.logger.error('Invalid message format');
      this.logger.error(JSON.stringify(message));
      return;
    }

    const {
      requestId,
      type,
      value
    } = message;

    if (typeof type !== 'string') {
      this.logger.error('Invalid message format, type property should be of type "string"');
      this.logger.error(JSON.stringify(message));
      return;
    }

    if (typeof value !== 'object') {
      this.logger.error('Invalid message format, value property should be of type "object"');
      this.logger.error(JSON.stringify(message));
      return;
    }

    if (type === RESPONSE && typeof requestId === 'number') {
      const callback = this.requestCallbackMap.get(requestId);

      if (typeof callback !== 'function') {
        this.logger.error(`Callback for request ${requestId} does not exist`);
        return;
      }

      const {
        success,
        code,
        text
      } = value;

      if (typeof success !== 'boolean') {
        this.logger.error('Response message contained an invalid value success property');
        this.logger.error(JSON.stringify(message));
        callback(false, 400, 'Response message contained an invalid value success property');
        return;
      }

      if (typeof code !== 'number') {
        this.logger.error('Response message contained an invalid value code property');
        this.logger.error(JSON.stringify(message));
        callback(false, 400, 'Response message contained an invalid value code property');
        return;
      }

      if (typeof text !== 'string') {
        this.logger.error('Response message contained an invalid value text property');
        this.logger.error(JSON.stringify(message));
        callback(false, 400, 'Response message contained an invalid value text property');
        return;
      }

      callback(success, code, text);
      return;
    }

    switch (type) {
      case SIGNAL:
        try {
          const {
            clientId,
            serverId,
            socketId,
            data
          } = value;

          if (typeof serverId !== 'number') {
            this.logger.error('Signal message contained an invalid server ID');
            this.logger.error(JSON.stringify(message));
            return;
          }

          if (typeof socketId !== 'number') {
            this.logger.error('Signal message contained an invalid socket ID');
            this.logger.error(JSON.stringify(message));
            return;
          }

          if (typeof data !== 'object') {
            this.logger.error('Signal message contained an invalid data property');
            this.logger.error(JSON.stringify(message));
            return;
          }

          const peer = this.peerMap.get(clientId);

          if (typeof peer === 'undefined') {
            const signalQueue = this.signalQueueMap.get(clientId);

            if (Array.isArray(signalQueue)) {
              signalQueue.push(data);
              return;
            }

            this.signalQueueMap.set(clientId, [data]);
            return;
          }

          if (peer.destroyed || peer.destroying) {
            return;
          }

          peer.signal(data);
        } catch (error) {
          this.logger.error('Unable to process signal message');
          this.logger.errorStack(error);
        }

        break;

      default:
        this.logger.warn(`Unknown message type ${type}`);
    }
  }

  close() {
    this.active = false;
    const oldSocketData = [...this.socketMap.values()];
    const oldUserIds = [...this.userIds];
    this.braidClient.data.removeListener('set', this.handleSet);
    this.braidClient.stopPublishing(this.publishName);
    this.braidClient.unsubscribe(this.name);
    this.braidClient.removeServerEventListener(this.name);
    this.socketMap.clear();
    this.userIds.clear();

    for (const timeout of this.peerDisconnectTimeouts.values()) {
      clearTimeout(timeout);
    }

    for (const socketData of oldSocketData) {
      this.emit('socketLeave', socketData);
    }

    for (const userId of oldUserIds) {
      this.emit('leave', userId);
    }

    this.emit('close');
  }

}
//# sourceMappingURL=index.js.map