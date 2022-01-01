function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import EventEmitter from 'events';
import ObservedRemoveMap from 'observed-remove/dist/map';
import SimplePeer from 'simple-peer';
import PQueue from 'p-queue';
import { pack, unpack } from 'msgpackr';
import { SIGNAL, START_SESSION, LEAVE_SESSION, JOIN_SESSION, INVITE_TO_SESSION, DECLINE_INVITE_TO_SESSION, SESSION_QUEUE, ABORT_SESSION_JOIN_REQUEST, SESSION_JOIN_REQUEST, SESSION_JOIN_RESPONSE, REMOVE_FROM_SESSION, RESPONSE } from './constants';
import { AbortError, RequestError, StartSessionError, RequestTimeoutError, JoinSessionError, LeaveSessionError, SignalError, SessionJoinResponseError, ClientClosedError, InviteToSessionError, InvitationDeclinedError, InvitedUserLeftError, InvitationTimeoutError, DeclineInviteToSessionError, RemoveFromSessionError } from './errors';
import { Ping, Pong, ObservedRemoveDump } from './messagepack';

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

const getSessionId = (values, clientId) => {
  if (typeof values === 'undefined') {
    return false;
  }

  for (const x of values) {
    if (x[3] === clientId) {
      return x[4] || false;
    }
  }

  return false;
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
      clientId,
      sessionId
    } = socket;
    const sessionClientMap = map.get(sessionId);

    if (typeof sessionClientMap === 'undefined') {
      map.set(sessionId, new Map([[clientId, socket]]));
    } else {
      sessionClientMap.set(clientId, socket);
    }
  }

  return map;
};

export class Bond extends EventEmitter {
  constructor(braidClient, roomId, userId, options = {}) {
    super();
    this.active = true;
    this.clientId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    this.userId = userId;
    this.roomId = roomId;
    this.sessionId = false;
    const name = `signal/${this.roomId}`;
    this.name = name;
    this.publishName = `signal/${this.roomId}/${this.clientId.toString(36)}`;
    this.braidClient = braidClient;
    this.logger = options.logger || braidClient.logger;
    this.peerOptions = options.peerOptions;
    this.socketMap = new Map();
    this.userIds = new Set();
    this.peerMap = new Map();
    this.peerReconnectMap = new Map();
    this.queueMap = new Map();
    this.sessionMap = new Map();
    this.inviteDeclineHandlerMap = new Map();
    this.requestCallbackMap = new Map();
    this.signalQueueMap = new Map();
    this.peerDisconnectTimeoutMap = new Map();
    this.sessionJoinHandlerMap = new Map();
    this.sessionJoinRequestMap = new Map();
    this.data = new ObservedRemoveMap([], {
      bufferPublishing: 0
    });
    this.sessionClientOffsetMap = new Map();
    this.preApprovedSessionUserIdSet = new Set();
    this.addListener('sessionClientJoin', this.handleSessionClientJoin.bind(this));
    this._ready = this.init(); // eslint-disable-line no-underscore-dangle

    if (typeof options.sessionId === 'string') {
      this.ready = this.joinSession(options.sessionId);
    } else {
      this.ready = this._ready; // eslint-disable-line no-underscore-dangle
    }

    this.addListener('socketJoin', socketData => {
      const {
        clientId
      } = socketData;

      if (clientId === this.clientId) {
        return;
      }

      if (this.peerDisconnectTimeoutMap.has(clientId)) {
        this.logger.info(`Clearing client ${clientId} disconnect timeout after socket join`);
        clearTimeout(this.peerDisconnectTimeoutMap.get(clientId));
        this.peerDisconnectTimeoutMap.delete(clientId);
      }

      this.addToQueue(clientId, () => this.connectToPeer(socketData));
    });
    this.addListener('socketLeave', socketData => {
      const {
        clientId
      } = socketData;

      if (clientId === this.clientId) {
        return;
      }

      clearTimeout(this.peerDisconnectTimeoutMap.get(clientId));

      if (this.active) {
        this.peerDisconnectTimeoutMap.set(clientId, setTimeout(() => {
          this.peerDisconnectTimeoutMap.delete(clientId);
          this.addToQueue(clientId, () => this.disconnectFromPeer(socketData));
        }, 15000));
      } else {
        this.addToQueue(clientId, () => this.disconnectFromPeer(socketData));
      }
    });
    this.addListener('sessionClientJoin', () => {
      const sessionClientIds = this.sessionClientIds;

      if (sessionClientIds.size > 1) {
        return;
      }

      clearTimeout(this.leaveSessionAfterLastClientTimeout);
    });
    this.addListener('sessionClientLeave', async () => {
      const sessionClientIds = this.sessionClientIds;

      if (sessionClientIds.size > 1) {
        return;
      }

      this.leaveSessionAfterLastClientTimeout = setTimeout(async () => {
        try {
          await this.leaveSession();
        } catch (error) {
          this.logger.error('Unable to leave session after timeout when last session closed');
          this.logger.errorStack(error);
        }
      }, 5000);
    });
    this.addListener('session', async () => {
      this.data.clear();
      this.sessionClientOffsetMap.clear();
    });

    this.handleBraidSet = (key, values) => {
      if (key !== name) {
        return;
      }

      this.active = true;
      const oldSessionId = this.sessionId;
      const newSessionId = getSessionId(values, this.clientId);
      const oldSocketMap = this.socketMap;
      const newSocketMap = getSocketMap(values);
      const oldUserIds = this.userIds;
      const newUserIds = getPeerIds(values);
      const oldSessionMap = this.sessionMap;
      const newSessionMap = getSessionMap(newSocketMap);
      const oldLocalSessionSocketMap = typeof oldSessionId === 'string' ? oldSessionMap.get(oldSessionId) || new Map() : new Map();
      const newLocalSessionSocketMap = typeof newSessionId === 'string' ? newSessionMap.get(newSessionId) || new Map() : new Map();
      this.sessionId = newSessionId;
      this.userIds = newUserIds;
      this.socketMap = newSocketMap;
      this.sessionMap = newSessionMap;

      if (newSessionId !== oldSessionId) {
        this.emit('session', newSessionId);
      }

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

      for (const [clientId, socketData] of oldLocalSessionSocketMap) {
        if (clientId === this.clientId) {
          continue;
        }

        if (!newLocalSessionSocketMap.has(clientId)) {
          this.emit('sessionClientLeave', clientId, socketData);
        }
      }

      for (const [clientId, socketData] of newLocalSessionSocketMap) {
        if (clientId === this.clientId) {
          continue;
        }

        if (!oldLocalSessionSocketMap.has(clientId)) {
          this.emit('sessionClientJoin', clientId, socketData);
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

    this.handleBraidClose = () => {
      this.reset();
    };

    this.handleBraidCloseRequested = () => {
      this.close();
    };

    this.handleBraidReconnect = isReconnecting => {
      if (!isReconnecting) {
        return;
      }

      const startedSessionId = this.startedSessionId;
      const joinedSessionId = this.joinedSessionId;

      const handleInitialized = () => {
        if (typeof startedSessionId === 'string') {
          this.logger.info(`Restarting session ${startedSessionId}`);
          this.startSession(startedSessionId).catch(error => {
            this.logger.error(`Unable to restart session ${startedSessionId} after reconnect`);
            this.logger.errorStack(error);
          });
        }

        if (typeof joinedSessionId === 'string') {
          this.logger.info(`Rejoining session ${joinedSessionId}`);
          this.joinSession(joinedSessionId).catch(error => {
            this.logger.error(`Unable to rejoin session ${joinedSessionId} after reconnect`);
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
    };

    this.braidClient.data.addListener('set', this.handleBraidSet);
    this.braidClient.addListener('close', this.handleBraidClose);
    this.braidClient.addListener('closeRequested', this.handleBraidCloseRequested);
    this.braidClient.addListener('reconnect', this.handleBraidReconnect);
  }

  get sessionClientMap() {
    const sessionId = this.sessionId;

    if (typeof sessionId !== 'string') {
      return new Map();
    }

    const sessionClientMap = this.sessionMap.get(sessionId);

    if (typeof sessionClientMap === 'undefined') {
      return new Map();
    }

    return sessionClientMap;
  }

  get sessionClientIds() {
    return new Set(this.sessionClientMap.keys());
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

      if (!this.active) {
        return;
      }

      await promise;

      if (!this.active) {
        return;
      }

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

  async publish(type, value, options = {}) {
    await this._ready; // eslint-disable-line no-underscore-dangle

    const timeoutDuration = typeof options.timeoutDuration === 'number' ? options.timeoutDuration : 5000;
    const CustomError = typeof options.CustomError === 'function' ? options.CustomError : RequestError;
    const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    return new Promise((resolve, reject) => {
      const handleClose = () => {
        this.requestCallbackMap.delete(requestId);
        clearTimeout(timeout);
        this.removeListener('close', handleClose);
        reject(new ClientClosedError(`Client closed before ${type} request completed`));
      };

      const timeout = setTimeout(() => {
        this.requestCallbackMap.delete(requestId);
        this.removeListener('close', handleClose);
        reject(new RequestTimeoutError(`${type} requested timed out after ${timeoutDuration}ms`));
      }, timeoutDuration);

      const handleResponse = (success, code, text) => {
        this.requestCallbackMap.delete(requestId);
        clearTimeout(timeout);
        this.removeListener('close', handleClose);

        if (success) {
          resolve({
            code,
            text
          });
          return;
        }

        reject(new CustomError(text, code));
      };

      this.addListener('close', handleClose);
      this.requestCallbackMap.set(requestId, handleResponse);
      this.braidClient.publish(this.publishName, {
        requestId,
        type,
        value
      });
    });
  }

  isConnectedToClient(clientId) {
    const peer = this.peerMap.get(clientId);

    if (typeof peer === 'undefined') {
      return false;
    }

    return !!peer.connected;
  }

  async connectToPeer(socket) {
    const {
      userId,
      serverId,
      socketId,
      clientId,
      socketHash
    } = socket;
    const reconnectCount = this.peerReconnectMap.get(clientId) || 0;
    const reconnectDelay = reconnectCount > 5 ? 30000 : 1000 * (reconnectCount * reconnectCount);

    if (reconnectDelay > 0) {
      this.logger.info(`Delaying connect by ${Math.round(reconnectDelay / 1000)} ${reconnectDelay === 1000 ? 'second' : 'seconds'} on attempt ${reconnectCount}`);
      await new Promise(resolve => {
        const timeout = setTimeout(() => {
          this.removeListener('close', handleClose);
          this.removeListener('socketLeave', handleSocketLeave);
          resolve();
        }, reconnectDelay);

        const handleClose = () => {
          clearTimeout(timeout);
          this.removeListener('close', handleClose);
          this.removeListener('socketLeave', handleSocketLeave);
          resolve();
        };

        const handleSocketLeave = ({
          socketHash: oldSocketHash
        }) => {
          if (socketHash !== oldSocketHash) {
            return;
          }

          clearTimeout(timeout);
          this.removeListener('close', handleClose);
          this.removeListener('socketLeave', handleSocketLeave);
          resolve();
        };

        this.addListener('close', handleClose);
        this.addListener('socketLeave', handleSocketLeave);
      });

      if (!this.socketMap.has(socketHash)) {
        return;
      }
    }

    const existingPeer = this.peerMap.get(clientId);
    const options = Object.assign({}, {
      initiator: clientId > this.clientId
    }, this.peerOptions);
    const peer = existingPeer || new SimplePeer(options);
    this.peerMap.set(clientId, peer);
    this.peerReconnectMap.set(clientId, reconnectCount + 1);
    this.emit('peer', {
      clientId,
      peer
    });

    const addPeerListeners = () => {
      this.peerReconnectMap.set(clientId, 0);

      const cleanup = () => {
        peer.removeListener('signal', handleSignal);
        peer.removeListener('stream', handleStream);
        peer.removeListener('error', handlePeerError);
        peer.removeListener('close', handlePeerClose);
        peer.removeListener('peerReconnect', handlePeerReconnect);
      };

      const handleSignal = async data => {
        try {
          await this.publish(SIGNAL, {
            serverId,
            socketId,
            data
          }, {
            CustomError: SignalError
          });
        } catch (error) {
          this.logger.error(`Unable to signal user ${userId} client ${clientId} closed`);
          this.logger.errorStack(error);
        }
      };

      const handleStream = stream => {
        if (!this.sessionClientIds.has(clientId)) {
          this.logger.error(`Received an unexpected stream from non-session user ${userId} client ${clientId}`);
          stream.getTracks().forEach(track => {
            track.stop();
            track.dispatchEvent(new Event('stop'));
          });
          return;
        }

        this.emit('stream', {
          stream,
          userId,
          serverId,
          socketId,
          clientId
        });
      };

      const handlePeerClose = () => {
        this.logger.info(`Disconnected from user ${userId} client ${clientId}`);
        cleanup();
        this.emit('disconnect', {
          userId,
          serverId,
          socketId,
          clientId
        });

        if (this.peerMap.has(clientId)) {
          this.peerMap.delete(clientId);
          this.connectToPeer(socket);
          this.logger.warn(`Reconnecting to user ${userId} client ${clientId}`);
        }
      };

      const handlePeerError = error => {
        this.logger.error(`Error in connection to user ${userId} client ${clientId}`);
        this.logger.errorStack(error);
        this.emit('peerError', {
          userId,
          serverId,
          socketId,
          clientId,
          error
        });
      };

      const handlePeerReconnect = () => {
        this.logger.info(`Reconnected to user ${userId} client ${clientId}`);
        cleanup();
      };

      peer.addListener('signal', handleSignal);
      peer.addListener('stream', handleStream);
      peer.addListener('close', handlePeerClose);
      peer.addListener('error', handlePeerError);
      peer.addListener('peerReconnect', handlePeerReconnect);
    };

    if (peer.connected) {
      peer.emit('peerReconnect');
      addPeerListeners();
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
      const cleanup = () => {
        clearTimeout(timeout);
        peer.removeListener('error', handlePeerError);
        peer.removeListener('close', handlePeerClose);
        peer.removeListener('connect', handleConnect);
        peer.removeListener('signal', handleSignal);
        this.removeListener('close', handleClose);
        this.removeListener('socketLeave', handleSocketLeave);
      };

      const timeout = setTimeout(() => {
        cleanup();
        resolve();
      }, 5000);

      const handleConnect = () => {
        cleanup();
        addPeerListeners();
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
          }, {
            CustomError: SignalError
          });
        } catch (error) {
          this.logger.error(`Unable to signal user ${userId} client ${clientId} closed`);
          this.logger.errorStack(error);
        }
      };

      const handleClose = () => {
        cleanup();
        resolve();
      };

      const handlePeerClose = () => {
        this.logger.info(`Connection to user ${userId} client ${clientId} closed`);
        cleanup();

        if (this.peerMap.has(clientId)) {
          this.peerMap.delete(clientId);
          this.connectToPeer(socket);
          this.logger.warn(`Reconnecting to user ${userId} client ${clientId}`);
        }

        resolve();
      };

      const handlePeerError = error => {
        cleanup();
        this.logger.error(`Error connecting to ${userId}`);
        this.logger.errorStack(error);
        this.emit('peerError', {
          userId,
          serverId,
          socketId,
          clientId,
          error
        });
        this.emit('error', error);
        resolve();
      };

      const handleSocketLeave = ({
        socketHash: oldSocketHash
      }) => {
        if (socketHash !== oldSocketHash) {
          return;
        }

        cleanup();
        this.logger.warn(`Unable to connect to user ${userId} client ${clientId}, socket closed before connection was completed`);
        resolve();
      };

      peer.addListener('error', handlePeerError);
      peer.addListener('close', handlePeerClose);
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

  async addStream(clientId, stream) {
    const peer = await this.getConnectedPeer(clientId);
    peer.addStream(stream);
  }

  async removeStream(clientId, stream) {
    const peer = await this.getConnectedPeer(clientId);
    peer.removeStream(stream);
  }

  async disconnectFromPeer({
    clientId
  }) {
    const peer = this.peerMap.get(clientId);

    if (typeof peer === 'undefined') {
      return;
    }

    this.peerMap.delete(clientId);
    peer.destroy();
  }

  async onIdle() {
    while (this.queueMap.size > 0) {
      for (const queue of this.queueMap.values()) {
        await queue.onIdle();
      } // $FlowFixMe


      await new Promise(resolve => queueMicrotask(resolve));
    }
  }

  didStartSession() {
    if (!this.sessionId) {
      return false;
    }

    return this.startedSessionId === this.sessionId;
  }

  async removeFromSession(clientId) {
    const sessionId = this.sessionId;

    if (sessionId === false) {
      this.logger.warn(`Unable to remove client ${clientId} from session, not in a session`);
      return;
    }

    const sessionClientMap = this.sessionClientMap;
    const socket = sessionClientMap.get(clientId);

    if (typeof socket === 'undefined') {
      this.logger.warn(`Unable to remove client ${clientId}, client not in session ${sessionId}`);
      return;
    }

    const {
      userId,
      socketId,
      serverId
    } = socket;

    if (this.userId !== userId) {
      this.preApprovedSessionUserIdSet.delete(userId);
    }

    await this.publish(REMOVE_FROM_SESSION, {
      userId,
      socketId,
      serverId
    }, {
      CustomError: RemoveFromSessionError
    });
  }

  async inviteToSession(userId, options = {}) {
    const {
      data,
      timeoutDuration = 30000,
      sessionJoinHandler
    } = options;
    const queue = this.queueMap.get(SESSION_QUEUE);

    if (typeof queue !== 'undefined') {
      await queue.onIdle();
    }

    const hasSessionId = this.sessionId === 'string'; // $FlowFixMe

    const sessionId = this.sessionId || globalThis.crypto.randomUUID(); // eslint-disable-line no-undef

    if (hasSessionId) {
      this.preApprovedSessionUserIdSet.add(userId);
      await this.publish(INVITE_TO_SESSION, {
        userId,
        sessionId,
        data
      }, {
        CustomError: InviteToSessionError
      });
    } else {
      await this.startSession(sessionId, sessionJoinHandler);
      this.preApprovedSessionUserIdSet.add(userId);
      await this.publish(INVITE_TO_SESSION, {
        userId,
        sessionId,
        data
      }, {
        CustomError: InviteToSessionError
      });
    }

    await new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timeout);
        this.removeListener('sessionJoin', handleSessionJoin);
        this.removeListener('close', handleClose);
        this.removeListener('leave', handleLeave);
        this.removeListener('session', handleSession);
        this.removeListener('socketLeave', handleSocketLeave);
        this.inviteDeclineHandlerMap.delete(`${userId}:${sessionId}`);
      };

      const leaveSession = async () => {
        if (hasSessionId) {
          return;
        }

        try {
          await this.leaveSession();
        } catch (error) {
          this.logger.error('Unable to leave session after invite timeout');
          this.logger.errorStack(error);
        }
      };

      const timeout = setTimeout(async () => {
        cleanup();
        await leaveSession();
        reject(new InvitationTimeoutError(`Invitation timed out after ${Math.round(timeoutDuration / 100) / 10} seconds`));
      }, timeoutDuration);

      const handleSessionJoin = socket => {
        if (socket.sessionId !== sessionId) {
          return;
        }

        if (socket.userId !== userId) {
          return;
        }

        cleanup();
        resolve();
      }; // Only listen for socket leave events if the user is inviting themselves


      const handleSocketLeave = async socket => {
        if (socket.userId !== this.userId) {
          return;
        }

        let isOnlySocketForUserId = true;

        for (const socketData of this.socketMap.values()) {
          if (socketData.userId !== this.userId) {
            continue;
          }

          if (socketData.clientId === this.clientId) {
            continue;
          }

          isOnlySocketForUserId = false;
        }

        if (isOnlySocketForUserId) {
          cleanup();
          await leaveSession();
          reject(new InvitedUserLeftError(`User ${userId} left before accepting the invitation`));
        }
      };

      const handleSession = newSessionId => {
        if (newSessionId === sessionId) {
          return;
        }

        cleanup();
        resolve();
      };

      const handleClose = () => {
        cleanup();
        reject(new ClientClosedError('Closed before invite'));
      };

      const handleDecline = async () => {
        cleanup();
        await leaveSession();
        reject(new InvitationDeclinedError('Invitation declined'));
      };

      const handleLeave = async peerUserId => {
        if (userId !== peerUserId) {
          return;
        }

        cleanup();
        await leaveSession();
        reject(new InvitedUserLeftError(`User ${userId} left before accepting the invitation`));
      };

      this.inviteDeclineHandlerMap.set(`${userId}:${sessionId || ''}`, handleDecline);
      this.addListener('sessionJoin', handleSessionJoin);
      this.addListener('close', handleClose);
      this.addListener('leave', handleLeave);
      this.addListener('session', handleSession);

      if (this.userId === userId) {
        this.addListener('socketLeave', handleSocketLeave);
      }
    });
  }

  async startSession(sessionId, sessionJoinHandler) {
    this.preApprovedSessionUserIdSet.clear();
    const previousStartedSessionId = this.startedSessionId;
    this.startedSessionId = sessionId;

    try {
      await this.addToQueue(SESSION_QUEUE, () => this.publish(START_SESSION, {
        sessionId
      }, {
        CustomError: StartSessionError
      }));
    } catch (error) {
      this.startedSessionId = previousStartedSessionId;
      throw error;
    }

    delete this.joinedSessionId;

    if (typeof sessionJoinHandler === 'function') {
      const wrappedSessionJoinHandler = async values => {
        if (this.preApprovedSessionUserIdSet.has(values.userId)) {
          return [true, 200, 'Authorized'];
        }

        if (this.userId === values.userId) {
          return [true, 200, 'Authorized'];
        }

        if (typeof sessionJoinHandler === 'function') {
          return sessionJoinHandler(values);
        }

        return [true, 200, 'Authorized'];
      };

      this.sessionJoinHandlerMap.set(sessionId, wrappedSessionJoinHandler);
    } else {
      this.sessionJoinHandlerMap.set(sessionId, () => [true, 200, 'Authorized']);
    }
  }

  didJoinSession() {
    if (!this.sessionId) {
      return false;
    }

    return this.joinedSessionId === this.sessionId;
  }

  async joinSession(sessionId, timeoutDuration = 30000) {
    const previousJoinedSessionId = this.joinedSessionId;
    this.joinedSessionId = sessionId;

    try {
      await this.addToQueue(SESSION_QUEUE, () => this.publish(JOIN_SESSION, {
        sessionId,
        timeoutDuration
      }, {
        CustomError: JoinSessionError
      }));
    } catch (error) {
      this.joinedSessionId = previousJoinedSessionId;
      throw error;
    }

    const startedSessionId = this.startedSessionId;
    delete this.startedSessionId;

    if (typeof startedSessionId === 'string') {
      this.sessionJoinHandlerMap.delete(startedSessionId);
    }
  }

  async leaveSession() {
    try {
      await this.addToQueue(SESSION_QUEUE, () => this.publish(LEAVE_SESSION, {}, {
        CustomError: LeaveSessionError
      }));
      const startedSessionId = this.startedSessionId;
      delete this.startedSessionId;
      delete this.joinedSessionId;

      if (typeof startedSessionId === 'string') {
        this.sessionJoinHandlerMap.delete(startedSessionId);
      }
    } catch (error) {
      if (error instanceof ClientClosedError) {
        return;
      }

      throw error;
    }
  }

  async handleMessage(message) {
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

      case DECLINE_INVITE_TO_SESSION:
        try {
          const {
            userId,
            sessionId
          } = value;

          if (typeof userId !== 'string') {
            this.logger.error('Decline invite request contained an invalid user ID');
            this.logger.error(JSON.stringify(message));
            return;
          }

          if (typeof sessionId !== 'string') {
            this.logger.error('Decline invite request contained an invalid session ID');
            this.logger.error(JSON.stringify(message));
            return;
          }

          const requestHash = `${userId}:${sessionId}`;
          const inviteDeclineHandler = this.inviteDeclineHandlerMap.get(requestHash);

          if (typeof inviteDeclineHandler === 'function') {
            inviteDeclineHandler();
          }
        } catch (error) {
          this.logger.error('Unable to process decline invite request');
          this.logger.errorStack(error);
        }

        break;

      case ABORT_SESSION_JOIN_REQUEST:
        try {
          const {
            userId,
            sessionId
          } = value;

          if (typeof userId !== 'string') {
            this.logger.error('Abort session join request contained an invalid user ID');
            this.logger.error(JSON.stringify(message));
            return;
          }

          if (typeof sessionId !== 'string') {
            this.logger.error('Abort session join request contained an invalid session ID');
            this.logger.error(JSON.stringify(message));
            return;
          }

          const requestHash = `${userId}:${sessionId}`;
          const existing = this.sessionJoinRequestMap.get(requestHash);

          if (!Array.isArray(existing)) {
            this.logger.warn(`Unable to abort session join request for user ${userId} and session ${sessionId}, request does not exist`);
            return;
          }

          this.logger.warn(`Aborting session join request for user ${userId} and session ${sessionId}`);
          existing[1].abort();
        } catch (error) {
          this.logger.error('Unable to process session abort join request');
          this.logger.errorStack(error);
        }

        break;

      case SESSION_JOIN_REQUEST:
        try {
          const {
            userId,
            sessionId
          } = value;

          if (typeof userId !== 'string') {
            this.logger.error('Session join request contained an invalid user ID');
            this.logger.error(JSON.stringify(message));
            return;
          }

          if (typeof sessionId !== 'string') {
            this.logger.error('Session join request contained an invalid session ID');
            this.logger.error(JSON.stringify(message));
            return;
          }

          const requestHash = `${userId}:${sessionId}`;
          const existing = this.sessionJoinRequestMap.get(requestHash);

          if (Array.isArray(existing)) {
            this.logger.warn(`Session join request for user ${userId} and session ${sessionId} already exists`);
            await existing[0];
            return;
          }

          const sessionJoinHandler = this.sessionJoinHandlerMap.get(sessionId);

          if (typeof sessionJoinHandler !== 'function') {
            this.logger.error(`Handler for session ${sessionId} does not exist`);
            return;
          }

          const abortController = new AbortController();
          abortController.signal.addEventListener('abort', () => {
            this.sessionJoinRequestMap.delete(requestHash);
          });

          const promise = (async () => {
            let response = [false, 500, 'Error in sesssion join handler'];

            try {
              response = await sessionJoinHandler({
                userId,
                sessionId,
                abortSignal: abortController.signal
              });
            } catch (error) {
              this.logger.error(`Unable to respond to session join request for user ${userId} and session ${sessionId}, error in session join handler`);
              this.logger.errorStack(error);
            }

            if (abortController.signal.aborted) {
              this.logger.warn(`Session join request for user ${userId} and session ${sessionId} was aborted`);
              return;
            }

            try {
              await this.publish(SESSION_JOIN_RESPONSE, {
                userId,
                sessionId,
                success: response[0],
                code: response[1],
                text: response[2]
              }, {
                CustomError: SessionJoinResponseError
              });
            } catch (error) {
              this.logger.error(`Unable to send session join response for user ${userId} and session ${sessionId}`);
              this.logger.errorStack(error);
            }

            this.sessionJoinRequestMap.delete(requestHash);
          })();

          this.sessionJoinRequestMap.set(requestHash, [promise, abortController]);
          await promise;
        } catch (error) {
          this.logger.error('Unable to process session join request');
          this.logger.errorStack(error);
        }

        break;

      default:
        this.logger.warn(`Unknown message type ${type}`);
    }
  }

  async getConnectedPeer(clientId) {
    const peer = this.peerMap.get(clientId);

    if (typeof peer !== 'undefined' && peer.connected) {
      return peer;
    }

    return new Promise((resolve, reject) => {
      let _peer; // eslint-disable-line no-underscore-dangle


      const cleanup = () => {
        this.removeListener('sessionClientLeave', handleSessionClientLeave);
        this.removeListener('connect', handleConnect);
        this.removeListener('peer', handlePeer);

        if (typeof _peer !== 'undefined') {
          _peer.removeListener('close', handlePeerClose);

          _peer.removeListener('error', handlePeerError);
        }
      };

      const handlePeerClose = () => {
        cleanup();
        reject(new Error(`Peer ${clientId} closed before connection was established`));
      };

      const handlePeerError = error => {
        cleanup();
        reject(error);
      };

      const handlePeer = ({
        clientId: newClientId,
        peer: _p
      }) => {
        if (newClientId !== clientId) {
          return;
        }

        _peer = _p;

        _p.addListener('close', handlePeerClose);

        _p.addListener('error', handlePeerError);
      };

      const handleConnect = ({
        clientId: newClientId,
        peer: _p
      }) => {
        if (newClientId !== clientId) {
          return;
        }

        cleanup();
        resolve(_p);
      };

      const handleSessionClientLeave = oldClientId => {
        if (clientId !== oldClientId) {
          return;
        }

        cleanup();
        reject(new Error(`Client ${clientId} left before connection was established`));
      };

      this.addListener('sessionClientLeave', handleSessionClientLeave);
      this.addListener('connect', handleConnect);
      this.addListener('peer', handlePeer);
    });
  }

  async handleSessionClientJoin(clientId) {
    let interval;

    let _peer; // eslint-disable-line no-underscore-dangle


    let offset = 0;
    const abortController = new AbortController();
    const abortSignal = abortController.signal;

    const cleanup = () => {
      abortController.abort();
      this.removeListener('sessionClientLeave', handleSessionClientLeave);

      if (typeof _peer !== 'undefined') {
        _peer.removeListener('close', handlePeerClose);

        _peer.removeListener('data', handlePeerData);
      }

      this.data.removeListener('publish', handleDataPublish);
      clearInterval(interval);
    };

    const handlePeerClose = () => {
      cleanup();

      if (this.sessionClientIds.has(clientId)) {
        this.handleSessionClientJoin(clientId);
      }
    };

    const handleSessionClientLeave = oldClientId => {
      if (clientId !== oldClientId) {
        return;
      }

      cleanup();
    };

    const handleDataPublish = queue => {
      sendToPeer(new ObservedRemoveDump(queue));
    };

    const sendToPeer = unpacked => {
      if (typeof peer === 'undefined') {
        throw new Error('Peer does not exist');
      }

      peer.send(pack(unpacked));
    };

    const handlePeerData = packed => {
      const message = unpack(packed);

      if (message instanceof Ping) {
        sendToPeer(new Pong(message.timestamp, Date.now()));
      } else if (message instanceof Pong) {
        offset = Date.now() - message.wallclock - (performance.now() - message.timestamp) / 2;
        this.sessionClientOffsetMap.set(clientId, offset);
      } else if (message instanceof ObservedRemoveDump) {
        this.data.process(message.queue);
      }
    };

    this.addListener('sessionClientLeave', handleSessionClientLeave);

    if (!this.isConnectedToClient(clientId)) {
      await new Promise(resolve => {
        const handleConnect = ({
          clientId: newClientId
        }) => {
          if (newClientId !== clientId) {
            return;
          }

          this.removeListener('connect', handleConnect);
          abortSignal.removeEventListener('abort', handleAbort);
          resolve();
        };

        const handleAbort = () => {
          this.removeListener('connect', handleConnect);
          abortSignal.removeEventListener('abort', handleAbort);
          resolve();
        };

        this.addListener('connect', handleConnect);
        abortSignal.addEventListener('abort', handleAbort);
      });

      if (abortSignal.aborted) {
        return;
      }
    }

    const peer = this.peerMap.get(clientId);
    _peer = peer;

    if (typeof peer === 'undefined') {
      throw new Error('Peer does not exist');
    }

    peer.addListener('close', handlePeerClose);
    peer.addListener('data', handlePeerData);
    interval = setInterval(() => {
      peer.send(pack(new Ping(performance.now())));
    }, 1000);
    peer.send(pack(new Ping(performance.now())));
    this.data.addListener('publish', handleDataPublish);
    handleDataPublish(this.data.dump());
  }

  declineInviteToSession(data) {
    return this.publish(DECLINE_INVITE_TO_SESSION, data, {
      CustomError: DeclineInviteToSessionError
    });
  }

  reset() {
    clearTimeout(this.leaveSessionAfterLastClientTimeout);
    this.handleBraidSet(this.name, []);
  }

  async close() {
    this.reset();
    this.active = false;

    try {
      await this.onIdle();
    } catch (error) {
      this.logger.error('Error in queue during close');
      this.logger.errorStack(error);
    }

    this.braidClient.data.removeListener('set', this.handleBraidSet);
    this.braidClient.removeListener('close', this.handleBraidClose);
    this.braidClient.removeListener('closeRequested', this.handleBraidCloseRequested);
    this.braidClient.removeListener('reconnect', this.handleBraidReconnect);
    this.braidClient.stopPublishing(this.publishName);
    this.braidClient.removeServerEventListener(this.name);
    this.braidClient.unsubscribe(this.name);
    this.emit('close');
  }

}

_defineProperty(Bond, "declineInviteToSession", void 0);

const publish = (braidClient, abortSignal, roomId, type, value, options = {}) => {
  const name = `signal/${roomId}`;
  const publishName = `signal/${roomId}/${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36)}`;
  const timeoutDuration = typeof options.timeoutDuration === 'number' ? options.timeoutDuration : 5000;
  const CustomError = typeof options.CustomError === 'function' ? options.CustomError : RequestError;
  const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timeout);
      abortSignal.removeEventListener('abort', handleAbort);
      braidClient.removeServerEventListener(name);
      braidClient.stopPublishing(publishName);
    };

    const handleAbort = () => {
      cleanup();
      reject(new AbortError(`Publish request aborted before ${type} request completed`));
    };

    const timeout = setTimeout(() => {
      cleanup();
      reject(new RequestTimeoutError(`${type} requested timed out after ${timeoutDuration}ms`));
    }, timeoutDuration);

    const handleMessage = message => {
      if (typeof message !== 'object') {
        return;
      }

      const {
        requestId: responseId,
        type: responseType,
        value: responseValue
      } = message;

      if (responseType !== RESPONSE) {
        return;
      }

      if (responseId !== requestId) {
        return;
      }

      const {
        success,
        code,
        text
      } = responseValue;
      cleanup();

      if (success) {
        resolve({
          code,
          text
        });
        return;
      }

      reject(new CustomError(text, code));
    };

    abortSignal.addEventListener('abort', handleAbort);
    Promise.all([braidClient.startPublishing(publishName), braidClient.addServerEventListener(name, handleMessage)]).then(() => {
      braidClient.publish(publishName, {
        requestId,
        type,
        value
      });
    }).catch(error => {
      cleanup();
      reject(error);
    });
  });
};

Bond.declineInviteToSession = (braidClient, abortSignal, data) => {
  const {
    roomId
  } = data;
  return publish(braidClient, abortSignal, roomId, DECLINE_INVITE_TO_SESSION, data, {
    CustomError: DeclineInviteToSessionError
  });
};
//# sourceMappingURL=index.js.map