// @flow

import EventEmitter from 'events';
import ObservedRemoveMap from 'observed-remove/dist/map';
import type BraidClient from '@bunchtogether/braid-client';
import SimplePeer from 'simple-peer';
import PQueue from 'p-queue';
import {
  pack,
  unpack,
} from 'msgpackr';
import {
  SIGNAL,
  START_SESSION,
  LEAVE_SESSION,
  JOIN_SESSION,
  SESSION_QUEUE,
  ABORT_SESSION_JOIN_REQUEST,
  SESSION_JOIN_REQUEST,
  SESSION_JOIN_RESPONSE,
  RESPONSE,
} from './constants';
import {
  RequestError,
  StartSessionError,
  RequestTimeoutError,
  JoinSessionError,
  LeaveSessionError,
  SignalError,
  SessionJoinResponseError,
  ClientClosedError,
} from './errors';
import {
  Ping,
  Pong,
  ObservedRemoveDump,
} from './messagepack';

type Logger = {
  debug: (string | number, ...any) => void,
  info: (string | number, ...any) => void,
  warn: (string | number, ...any) => void,
  error: (string | number, ...any) => void,
  errorStack: (error:Error | MediaError) => void,
};

type Options = {
  peerOptions?: Object,
  logger?: Logger
}

type SessionJoinHandler = ({ sessionId: string, userId: string, abortSignal: AbortSignal }) => [boolean, number, string] | Promise<[boolean, number, string]>;
type Connection = [number, number, string, number, string | false];
type Socket = { socketHash: string, socketId: number, serverId: number, userId: string, clientId: number, sessionId: string | false };

const getSocketMap = (values?:Array<Connection>):Map<string, Socket> => {
  if (typeof values === 'undefined') {
    return new Map();
  }
  return new Map(values.map((x) => {
    const socketHash = `${x[0]}:${x[1]}`;
    return [socketHash, { socketHash, socketId: x[0], serverId: x[1], userId: x[2], clientId: x[3], sessionId: x[4] }];
  }));
};

const getPeerIds = (values?:Array<Connection>):Set<string> => {
  if (typeof values === 'undefined') {
    return new Set();
  }
  return new Set(values.map((x) => x[2]));
};

const getSessionMap = (socketMap:Map<string, Socket>):Map<string, Map<number, Socket>> => {
  const map = new Map();
  for (const socket of socketMap.values()) {
    const { clientId, sessionId } = socket;
    if (sessionId === false) {
      continue;
    }
    const sessionClientMap = map.get(sessionId);
    if (typeof sessionClientMap === 'undefined') {
      map.set(sessionId, new Map([[clientId, socket]]));
    } else {
      sessionClientMap.set(clientId, socket);
    }
  }
  return map;
};

// $FlowFixMe
class CustomObservedRemoveMap<K, V> extends ObservedRemoveMap<K, V> {
  // $FlowFixMe
  declare publishTimeout: null | true;

  dequeue() {
    if (this.publishTimeout) {
      return;
    }
    this.publishTimeout = true;
    // $FlowFixMe
    queueMicrotask(() => this.publish());
  }
}

export class Bond extends EventEmitter {
  declare roomId: string;
  declare clientId: number;
  declare name: string;
  declare publishName: string;
  declare braidClient: BraidClient;
  declare logger: Logger;
  declare ready: Promise<void>;
  declare socketMap: Map<string, Socket>;
  declare sessionMap: Map<string, Map<number, Socket>>;
  declare userIds: Set<string>;
  declare peerOptions: void | Object;
  declare peerMap: Map<number, SimplePeer>;
  declare queueMap: Map<string | number, PQueue>;
  declare handleSet: (string, any) => void;
  declare signalQueueMap: Map<number, Array<[string, Object]>>;
  declare requestCallbackMap: Map<number, (boolean, number, string) => void | Promise<void>>;
  declare sessionId: void | string;
  declare startedSessionId: void | string;
  declare joinedSessionId: void | string;
  declare active: boolean;
  declare peerDisconnectTimeoutMap: Map<number, TimeoutID>;
  declare sessionJoinHandlerMap: Map<string, SessionJoinHandler>;
  declare sessionJoinRequestMap: Map<string, [Promise<void>, AbortController]>;
  declare data: CustomObservedRemoveMap<string | number, any>;
  declare sessionClientOffsetMap: Map<number, number>;

  constructor(braidClient: BraidClient, roomId:string, userId:string, options?: Options = {}) {
    super();
    this.active = true;
    this.clientId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    this.roomId = roomId;
    const name = `signal/${this.roomId}`;
    this.name = name;
    this.publishName = `signal/${this.roomId}/${this.clientId.toString(36)}`;
    this.braidClient = braidClient;
    this.ready = this.init();
    this.logger = options.logger || braidClient.logger;
    this.peerOptions = options.peerOptions;
    this.socketMap = new Map();
    this.userIds = new Set();
    this.peerMap = new Map();
    this.queueMap = new Map();
    this.sessionMap = new Map();
    this.requestCallbackMap = new Map();
    this.signalQueueMap = new Map();
    this.peerDisconnectTimeoutMap = new Map();
    this.sessionJoinHandlerMap = new Map();
    this.sessionJoinRequestMap = new Map();
    this.data = new CustomObservedRemoveMap([], { bufferPublishing: 0 });
    this.sessionClientOffsetMap = new Map();
    this.addListener('sessionClientJoin', this.handleSessionClientJoin.bind(this));
    this.handleSet = (key:string, values:Array<Connection>) => {
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
      const oldSessionClientIds = this.sessionClientIds;
      this.userIds = newUserIds;
      this.socketMap = newSocketMap;
      this.sessionMap = newSessionMap;
      const newSessionClientIds = this.sessionClientIds;
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
      for (const clientId of oldSessionClientIds) {
        if (clientId === this.clientId) {
          continue;
        }
        if (!newSessionClientIds.has(clientId)) {
          this.emit('sessionClientLeave', clientId);
        }
      }
      for (const clientId of newSessionClientIds) {
        if (clientId === this.clientId) {
          continue;
        }
        if (!oldSessionClientIds.has(clientId)) {
          this.emit('sessionClientJoin', clientId);
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
    this.addListener('socketJoin', (socketData:Socket) => {
      const { clientId } = socketData;
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
    this.addListener('socketLeave', (socketData:Socket) => {
      const { clientId } = socketData;
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
    this.braidClient.addListener('reconnect', (isReconnecting: boolean) => {
      if (!isReconnecting) {
        return;
      }
      const startedSessionId = this.startedSessionId;
      const joinedSessionId = this.joinedSessionId;
      const handleInitialized = () => {
        if (typeof startedSessionId === 'string') {
          this.logger.info(`Restarting session ${startedSessionId}`);
          this.startSession(startedSessionId).catch((error) => {
            this.logger.error(`Unable to restart session ${startedSessionId} after reconnect`);
            this.logger.errorStack(error);
          });
        }
        if (typeof joinedSessionId === 'string') {
          this.logger.info(`Rejoining session ${joinedSessionId}`);
          this.joinSession(joinedSessionId).catch((error) => {
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
      const handleError = (error:Error) => {
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

  get sessionClientIds():Set<number> {
    const sessionId = this.sessionId;
    if (typeof sessionId !== 'string') {
      return new Set();
    }
    const sessionClientMap = this.sessionMap.get(sessionId);
    if (typeof sessionClientMap === 'undefined') {
      return new Set();
    }
    const clientIds = new Set(sessionClientMap.keys());
    clientIds.delete(this.clientId);
    return clientIds;
  }

  async init() {
    const promise = new Promise((resolve, reject) => {
      const handleClose = () => {
        this.removeListener('close', handleClose);
        this.braidClient.data.removeListener('set', handleValue);
        this.braidClient.removeListener('error', handleError);
        reject(new Error('Closed before initialization completed'));
      };
      const handleValue = (key:string, value:any) => {
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
      const handleError = (error:Error) => {
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
      await Promise.all([
        this.braidClient.subscribe(this.name),
        this.braidClient.addServerEventListener(this.name, this.handleMessage.bind(this)),
      ]);
      await promise;
      await this.braidClient.startPublishing(this.publishName);
    } catch (error) {
      this.braidClient.logger.error(`Unable to join ${this.roomId}`);
      throw error;
    }
  }

  addToQueue(queueId:string | number, func:() => Promise<*>) {
    const queue = this.queueMap.get(queueId);
    if (typeof queue !== 'undefined') {
      return queue.add(func);
    }
    const newQueue = new PQueue({ concurrency: 1 });
    const promise = newQueue.add(func);
    this.queueMap.set(queueId, newQueue);
    newQueue.on('idle', () => {
      this.queueMap.delete(queueId);
    });
    return promise;
  }

  async publish(type:string, value:Object, options?: { timeoutDuration?: number, CustomError?: Class<RequestError> } = {}):Promise<{ text:string, code:number }> {
    await this.ready;
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
      const handleResponse = (success:boolean, code: number, text:string) => {
        this.requestCallbackMap.delete(requestId);
        clearTimeout(timeout);
        this.removeListener('close', handleClose);
        if (success) {
          resolve({ code, text });
          return;
        }
        reject(new CustomError(text, code));
      };
      this.addListener('close', handleClose);
      this.requestCallbackMap.set(requestId, handleResponse);
      this.braidClient.publish(this.publishName, { requestId, type, value });
    });
  }

  isConnectedToClient(clientId:number) {
    const peer = this.peerMap.get(clientId);
    if (typeof peer === 'undefined') {
      return false;
    }
    return !!peer.connected;
  }

  async connectToPeer({ userId, serverId, socketId, clientId, socketHash }:Socket) {
    const existingPeer = this.peerMap.get(clientId);
    const options = Object.assign({}, { initiator: clientId > this.clientId }, this.peerOptions);
    const peer = existingPeer || new SimplePeer(options);
    this.peerMap.set(clientId, peer);
    if (peer.connected) {
      peer.emit('peerReconnect');
      const handlePeerClose = () => {
        this.logger.info(`Peer ${socketHash} disconnected`);
        peer.removeListener('error', handlePeerError);
        peer.removeListener('close', handlePeerClose);
        peer.removeListener('peerReconnect', handlePeerReconnect);
        this.emit('disconnect', { userId, serverId, socketId, peer });
      };
      const handlePeerError = (error:Error) => {
        this.logger.error(`Peer ${socketHash} error`);
        this.logger.errorStack(error);
        this.emit('peerError', { error, userId, serverId, socketId, peer });
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
      this.emit('connect', { userId, clientId, serverId, socketId, peer });
      return;
    }
    await new Promise((resolve) => {
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
          this.emit('disconnect', { userId, serverId, socketId, peer });
        };
        const handlePeerError = (error:Error) => {
          this.logger.error(`Peer ${socketHash} error`);
          this.logger.errorStack(error);
          this.emit('peerError', { error, userId, serverId, socketId, peer });
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
        this.emit('connect', { userId, clientId, serverId, socketId, peer });
        resolve();
      };
      const handleSignal = async (data:Object) => {
        try {
          await this.publish(SIGNAL, { serverId, socketId, data }, { CustomError: SignalError });
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
      const handleError = (error:Error) => {
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
      const handleSocketLeave = ({ socketHash: oldSocketHash }:Socket) => {
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

  async disconnectFromPeer({ clientId }:Socket) {
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
      }
      // $FlowFixMe
      await new Promise((resolve) => queueMicrotask(resolve));
    }
  }

  cleanupSession(newSessionId?:string) {
    const startedSessionId = this.startedSessionId;
    delete this.startedSessionId;
    delete this.joinedSessionId;
    if (typeof startedSessionId === 'string') {
      this.sessionJoinHandlerMap.delete(startedSessionId);
    }
    const oldSessionId = this.sessionId;
    if (oldSessionId === newSessionId) {
      return;
    }
    const oldSessionClientIds = this.sessionClientIds;
    this.sessionId = newSessionId;
    const newSessionClientIds = this.sessionClientIds;
    for (const clientId of oldSessionClientIds) {
      if (clientId === this.clientId) {
        continue;
      }
      if (!newSessionClientIds.has(clientId)) {
        this.emit('sessionClientLeave', clientId);
      }
    }
    const timelineValue = this.data.get(this.clientId);
    this.data.clear();
    this.sessionClientOffsetMap.clear();
    if (typeof timelineValue !== 'undefined') {
      this.data.set(this.clientId);
    }
    for (const clientId of newSessionClientIds) {
      if (clientId === this.clientId) {
        continue;
      }
      if (!oldSessionClientIds.has(clientId)) {
        this.emit('sessionClientJoin', clientId);
      }
    }
  }

  async startSession(sessionId:string, sessionJoinHandler?: SessionJoinHandler) {
    await this.addToQueue(SESSION_QUEUE, () => this.publish(START_SESSION, { sessionId }, { CustomError: StartSessionError }));
    this.cleanupSession(sessionId);
    this.startedSessionId = sessionId;
    if (typeof sessionJoinHandler === 'function') {
      this.sessionJoinHandlerMap.set(sessionId, sessionJoinHandler);
    } else {
      this.sessionJoinHandlerMap.set(sessionId, () => [true, 200, 'Authorized']);
    }
  }

  async joinSession(sessionId:string, timeoutDuration?: number = 30000) {
    await this.addToQueue(SESSION_QUEUE, () => this.publish(JOIN_SESSION, { sessionId, timeoutDuration }, { CustomError: JoinSessionError }));
    this.cleanupSession(sessionId);
    this.joinedSessionId = sessionId;
  }

  async leaveSession() {
    await this.addToQueue(SESSION_QUEUE, () => this.publish(LEAVE_SESSION, {}, { CustomError: LeaveSessionError }));
    this.cleanupSession();
  }

  async handleMessage(message:{ requestId?: number, type:string, value:Object }) {
    if (typeof message !== 'object') {
      this.logger.error('Invalid message format');
      this.logger.error(JSON.stringify(message));
      return;
    }
    const { requestId, type, value } = message;
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
      const { success, code, text } = value;
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
            data,
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
      case ABORT_SESSION_JOIN_REQUEST:
        try {
          const {
            userId,
            sessionId,
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
            sessionId,
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
              response = await sessionJoinHandler({ userId, sessionId, abortSignal: abortController.signal });
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
                text: response[2],
              }, { CustomError: SessionJoinResponseError });
            } catch (error) {
              this.logger.error(`Unable to send session join request for user ${userId} and session ${sessionId}`);
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

  async handleSessionClientJoin(clientId:number) {
    let interval;
    let offset = 0;
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    const cleanup = () => {
      abortController.abort();
      this.removeListener('sessionClientLeave', handleSessionClientLeave);
      if (typeof peer !== 'undefined') {
        peer.removeListener('close', handlePeerClose);
        peer.removeListener('data', handlePeerData);
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
    const handleSessionClientLeave = (oldClientId:number) => {
      if (clientId !== oldClientId) {
        return;
      }
      cleanup();
    };
    const handleDataPublish = (queue:[Array<*>, Array<*>]) => {
      sendToPeer(new ObservedRemoveDump(queue));
    };
    const sendToPeer = (unpacked: any) => {
      if (typeof peer === 'undefined') {
        throw new Error('Peer does not exist');
      }
      peer.send(pack(unpacked));
    };
    const handlePeerData = (packed:Buffer) => {
      const message = unpack(packed);
      if (message instanceof Ping) {
        sendToPeer(new Pong(message.timestamp, Date.now()));
      } else if (message instanceof Pong) {
        offset = (Date.now() - message.wallclock) - (performance.now() - message.timestamp) / 2;
        this.sessionClientOffsetMap.set(clientId, offset);
      } else if (message instanceof ObservedRemoveDump) {
        this.data.process(message.queue);
      }
    };
    this.addListener('sessionClientLeave', handleSessionClientLeave);
    if (!this.isConnectedToClient(clientId)) {
      await new Promise((resolve) => {
        const handleConnect = ({ clientId: newClientId }) => {
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

  close() {
    this.active = false;
    const oldSessionClientIds = this.sessionClientIds;
    const oldSocketData = [...this.socketMap.values()];
    const oldUserIds = [...this.userIds];
    this.braidClient.data.removeListener('set', this.handleSet);
    this.braidClient.stopPublishing(this.publishName);
    this.braidClient.unsubscribe(this.name);
    this.braidClient.removeServerEventListener(this.name);
    this.socketMap.clear();
    this.userIds.clear();
    for (const timeout of this.peerDisconnectTimeoutMap.values()) {
      clearTimeout(timeout);
    }
    for (const clientId of oldSessionClientIds) {
      this.emit('sessionClientLeave', clientId);
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

