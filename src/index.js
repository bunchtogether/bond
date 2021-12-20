// @flow

import EventEmitter from 'events';
import type BraidClient from '@bunchtogether/braid-client';
import SimplePeer from 'simple-peer';
import PQueue from 'p-queue';
import {
  SIGNAL,
  START_SESSION,
  LEAVE_SESSION,
  RESPONSE,
} from './constants';
import { RequestError, RequestTimeoutError } from './errors';

type Logger = {
  debug: (string | number, ...any) => void,
  info: (string | number, ...any) => void,
  warn: (string | number, ...any) => void,
  error: (string | number, ...any) => void,
  errorStack: (error:Error | MediaError) => void,
};

type Options = {
  logger?: Logger,
  wrtc?: Object
}

type Connection = [number, number, string, string | false];
type Socket = { socketHash: string, socketId: number, serverId: number, userId: string, sessionId: string | false };

const getSocketMap = (values?:Array<Connection>):Map<string, Socket> => {
  if (typeof values === 'undefined') {
    return new Map();
  }
  return new Map(values.map((x) => {
    const socketHash = `${x[0]}:${x[1]}`;
    return [socketHash, { socketHash, socketId: x[0], serverId: x[1], userId: x[2], sessionId: x[3] }];
  }));
};

const getPeerIds = (values?:Array<Connection>):Set<string> => {
  if (typeof values === 'undefined') {
    return new Set();
  }
  return new Set(values.map((x) => x[2]));
};

const getSessionMap = (socketMap:Map<string, Socket>):Map<string | false, Map<string, Socket>> => {
  const map = new Map();
  for(const socket of socketMap.values()) {
    const { socketHash, sessionId } = socket;
    const sessionSocketMap = map.get(sessionId);
    if(typeof sessionSocketMap === 'undefined') {
      map.set(sessionId, new Map([[socketHash, socket]]));
    } else {
      sessionSocketMap.set(socketHash, socket);
    }
  }
  return map;
};

export class Bond extends EventEmitter {
  declare roomId: string;
  declare userId: string;
  declare name: string;
  declare braidClient: BraidClient;
  declare logger: Logger;
  declare ready: Promise<void>;
  declare socketMap: Map<string, Socket>;
  declare sessionMap: Map<string | false, Map<string, Socket>>;
  declare userIds: Set<string>;
  declare wrtc: void | Object;
  declare peerMap: Map<string, SimplePeer>;
  declare queueMap: Map<string, PQueue>;
  declare handleSet: (string, any) => void;
  declare signalQueueMap: Map<string, Array<[string, Object]>>;
  declare requestCallbackMap: Map<number, (boolean, number, string) => void | Promise<void>>;

  constructor(braidClient: BraidClient, roomId:string, userId:string, options?: Options = {}) {
    super();
    this.roomId = roomId;
    this.userId = userId;
    const name = `signal/${this.roomId}`;
    this.name = name;
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

    this.handleSet = (key:string, values:Array<Connection>) => {
      if (key !== name) {
        return;
      }
      const oldSocketMap = this.socketMap;
      const newSocketMap = getSocketMap(values);
      const oldUserIds = this.userIds
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
      for (const peerId of oldUserIds) {
        if (!newUserIds.has(peerId)) {
          this.emit('leave', peerId);
        }
      }
      for (const peerId of newUserIds) {
        if (!oldUserIds.has(peerId)) {
          this.emit('join', peerId);
        }
      }
      for (const [sessionId, oldSessionSocketMap] of oldSessionMap) {
        const newSessionSocketMap = newSessionMap.get(sessionId);
        if(typeof newSessionSocketMap === 'undefined') {
          for(const socketData of oldSessionSocketMap.values()) {
            this.emit('sessionLeave', socketData);
          }
        } else {
          for(const [socketHash, socketData] of oldSessionSocketMap) {
            if(!newSessionSocketMap.has(socketHash)) {
              this.emit('sessionLeave', socketData);
            }
          }
        }
      }
      for (const [sessionId, newSessionSocketMap] of newSessionMap) {
        const oldSessionSocketMap = oldSessionMap.get(sessionId);
        if(typeof oldSessionSocketMap === 'undefined') {
          for(const socketData of newSessionSocketMap.values()) {
            this.emit('sessionJoin', socketData);
          }
        } else {
          for(const [socketHash, socketData] of newSessionSocketMap) {
            if(!oldSessionSocketMap.has(socketHash)) {
              this.emit('sessionJoin', socketData);
            }
          }
        }
      }
    };
    this.braidClient.data.addListener('set', this.handleSet);
    this.on('socketJoin', (socketData:Socket) => {
      this.addToQueue(socketData.socketHash, () => this.connectToPeer(socketData));
    });
    this.on('socketLeave', (socketData:Socket) => {
      this.addToQueue(socketData.socketHash, () => this.disconnectFromPeer(socketData));
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
      await this.braidClient.startPublishing(this.name);
    } catch (error) {
      this.braidClient.logger.error(`Unable to join ${this.roomId}`);
      throw error;
    }
  }

  addToQueue(queueId:string, func:() => Promise<void>) {
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

  async publish(type:string, value:Object, timeoutDuration?: number = 5000):Promise<{ text:string, code:number }> {
    await this.ready;
    const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.requestCallbackMap.delete(requestId);
        reject(new RequestTimeoutError(`${type} requested timed out after ${timeoutDuration}ms`));
      }, timeoutDuration);
      const handleResponse = (success:boolean, code: number, text:string) => {
        this.requestCallbackMap.delete(requestId);
        clearTimeout(timeout);
        if (success) {
          resolve({ code, text });
          return;
        }
        reject(new RequestError(text, code));
      };
      this.requestCallbackMap.set(requestId, handleResponse);
      this.braidClient.publish(this.name, { requestId, type, value });
    });
  }

  async connectToPeer({ userId, serverId, socketId, socketHash }:Socket) {
    const peer = new SimplePeer({ initiator: userId > this.userId, wrtc: this.wrtc });
    this.peerMap.set(socketHash, peer);
    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        peer.removeListener('error', handleError);
        peer.removeListener('connect', handleConnect);
        peer.removeListener('signal', handleSignal);
        this.removeListener('close', handleClose);
        resolve();
      }, 5000);
      const handleConnect = () => {
        clearTimeout(timeout);
        peer.removeListener('error', handleError);
        peer.removeListener('connect', handleConnect);
        peer.removeListener('signal', handleSignal);
        this.removeListener('close', handleClose);
        const handlePeerClose = () => {
          this.logger.info(`Peer ${socketHash} disconnected`);
          peer.removeListener('error', handlePeerError);
          peer.removeListener('close', handlePeerClose);
          this.emit('disconnect', { userId, serverId, socketId, peer });
        };
        const handlePeerError = (error:Error) => {
          this.logger.error(`Peer ${socketHash} error`);
          this.logger.errorStack(error);
          this.emit('peerError', { error, userId, serverId, socketId, peer });
        };
        peer.addListener('close', handlePeerClose);
        peer.addListener('error', handlePeerError);
        this.emit('connect', { userId, serverId, socketId, peer });
        resolve();
      };
      const handleSignal = async (data:Object) => {
        try {
          await this.publish(SIGNAL, { serverId, socketId, data });
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
        resolve();
      };
      const handleError = (error:Error) => {
        clearTimeout(timeout);
        peer.removeListener('error', handleError);
        peer.removeListener('connect', handleConnect);
        peer.removeListener('signal', handleSignal);
        this.removeListener('close', handleClose);
        this.logger.error(`Error connecting to ${userId}`);
        this.logger.errorStack(error);
        this.emit('error', error);
        resolve();
      };
      peer.addListener('error', handleError);
      peer.addListener('connect', handleConnect);
      peer.addListener('signal', handleSignal);
      this.addListener('close', handleClose);
      const signalQueue = this.signalQueueMap.get(socketHash);
      if (Array.isArray(signalQueue)) {
        while (signalQueue.length > 0) {
          const data = signalQueue.shift();
          peer.signal(data);
        }
      }
    });
  }

  async disconnectFromPeer({ socketHash }:Socket) {
    const peer = this.peerMap.get(socketHash);
    if (typeof peer === 'undefined') {
      return;
    }
    peer.destroy();
    this.peerMap.delete(socketHash);
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

  startSession(sessionId:string, password?:string) {
    return this.publish(START_SESSION, { sessionId, password });
  }

  leaveSession() {
    return this.publish(LEAVE_SESSION, {});
  }

  handleMessage(message:{ requestId?: number, type:string, value:Object }) {
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
          const socketHash = `${socketId}:${serverId}`;
          const peer = this.peerMap.get(socketHash);
          if (typeof peer === 'undefined') {
            const signalQueue = this.signalQueueMap.get(socketHash);
            if (Array.isArray(signalQueue)) {
              signalQueue.push(data);
              return;
            }
            this.signalQueueMap.set(socketHash, [data]);
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
    const oldSocketMap = [...this.socketMap.keys()];
    const oldUserIds = [...this.userIds];
    this.braidClient.data.removeListener('set', this.handleSet);
    this.braidClient.stopPublishing(this.name);
    this.braidClient.unsubscribe(this.name);
    this.braidClient.removeServerEventListener(this.name);
    this.socketMap.clear();
    this.userIds.clear();
    for (const socketHash of oldSocketMap) {
      this.emit('socketLeave', socketHash);
    }
    for (const userId of oldUserIds) {
      this.emit('leave', userId);
    }
    this.emit('close');
  }
}

