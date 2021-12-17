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

export class Bond extends EventEmitter {
  declare roomId: string;
  declare userId: string;
  declare name: string;
  declare braidClient: BraidClient;
  declare logger: Logger;
  declare ready: Promise<void>;
  declare socketHashSet: Set<string>;
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
    this.socketHashSet = new Set();
    this.userIds = new Set();
    this.peerMap = new Map();
    this.queueMap = new Map();
    this.requestCallbackMap = new Map();
    this.signalQueueMap = new Map();
    this.handleSet = (key:string, values:Array<string>) => {
      if (key !== name) {
        return;
      }
      const oldUserIds = this.userIds;
      this.userIds = new Set();
      const newSocketHashes = [];
      const oldSocketHashes = [];
      for (const socketHash of this.socketHashSet) {
        if (!values.includes(socketHash)) {
          oldSocketHashes.push(socketHash);
          this.socketHashSet.delete(socketHash);
        }
      }
      for (const socketHash of values) {
        const [peerId] = socketHash.split(':');
        if (peerId === userId) {
          continue;
        }
        this.userIds.add(peerId);
        if (!this.socketHashSet.has(socketHash)) {
          newSocketHashes.push(socketHash);
          this.socketHashSet.add(socketHash);
        }
      }
      for (const socketHash of oldSocketHashes) {
        this.emit('socketLeave', socketHash);
      }
      for (const socketHash of newSocketHashes) {
        this.emit('socketJoin', socketHash);
      }
      for (const peerId of oldUserIds) {
        if (!this.userIds.has(peerId)) {
          this.emit('leave', peerId);
        }
      }
      for (const peerId of this.userIds) {
        if (!oldUserIds.has(peerId)) {
          this.emit('join', peerId);
        }
      }
    };
    this.braidClient.data.addListener('set', this.handleSet);
    this.on('socketJoin', (socketHash:string) => {
      this.addToQueue(socketHash, () => this.connectToPeer(socketHash));
    });
    this.on('socketLeave', (socketHash:string) => {
      this.addToQueue(socketHash, () => this.disconnectFromPeer(socketHash));
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
      await this.braidClient.startPublishing(this.name);
      await promise;
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

  async connectToPeer(socketHash:string) {
    const [peerId, serverIdString, socketIdString] = socketHash.split(':');
    const serverId = parseInt(serverIdString, 10);
    const socketId = parseInt(socketIdString, 10);
    const peer = new SimplePeer({ initiator: peerId > this.userId, wrtc: this.wrtc });
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
          this.emit('disconnect', { peerId, serverId, socketId, peer });
        };
        const handlePeerError = (error:Error) => {
          this.logger.error(`Peer ${socketHash} error`);
          this.logger.errorStack(error);
          this.emit('peerError', { error, peerId, serverId, socketId, peer });
        };
        peer.addListener('close', handlePeerClose);
        peer.addListener('error', handlePeerError);
        this.emit('connect', { peerId, serverId, socketId, peer });
        resolve();
      };
      const handleSignal = async (data:Object) => {
        try {
          await this.publish(SIGNAL, { peerId, serverId, socketId, data });
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
        this.logger.error(`Error connecting to ${peerId}`);
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

  async disconnectFromPeer(socketHash:string) {
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
            peerId,
            serverId,
            socketId,
            data,
          } = value;
          if (typeof peerId !== 'string') {
            this.logger.error('Signal message contained an invalid peer ID');
            this.logger.error(JSON.stringify(message));
            return;
          }
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
          const socketHash = `${peerId}:${serverId}:${socketId}`;
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
    const oldSocketHashes = [...this.socketHashSet];
    const oldUserIds = [...this.userIds];
    this.braidClient.data.removeListener('set', this.handleSet);
    this.braidClient.stopPublishing(this.name);
    this.braidClient.unsubscribe(this.name);
    this.braidClient.removeServerEventListener(this.name);
    this.socketHashSet.clear();
    this.userIds.clear();
    for (const socketHash of oldSocketHashes) {
      this.emit('socketLeave', socketHash);
    }
    for (const userId of oldUserIds) {
      this.emit('leave', userId);
    }
    this.emit('close');
  }
}

