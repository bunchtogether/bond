// @flow

import {
  addExtension,
} from 'msgpackr';

export class Ping {
  constructor(timestamp:number) {
    this.timestamp = timestamp;
  }
  declare timestamp: number;
}

function writePing(encoded: Ping) {
  return encoded.timestamp;
}

function readPing(decoded: number) {
  return new Ping(decoded);
}

addExtension({
  Class: Ping,
  type: 0x90,
  write: writePing,
  read: readPing,
});

export class Pong {
  constructor(timestamp:number, wallclock:number) {
    this.timestamp = timestamp;
    this.wallclock = wallclock;
  }
  declare timestamp: number;
  declare wallclock: number;
}

function writePong(encoded: Pong) {
  return [encoded.timestamp, encoded.wallclock];
}

function readPong(decoded:[number, number]) {
  return new Pong(decoded[0], decoded[1]);
}

addExtension({
  Class: Pong,
  type: 0x91,
  write: writePong,
  read: readPong,
});

export class ObservedRemoveDump {
  constructor(queue:[Array<*>, Array<*>]) {
    this.queue = queue;
  }
  declare queue:[Array<*>, Array<*>];
}

function writeObservedRemoveDump(encoded: ObservedRemoveDump) {
  return encoded.queue;
}

function readObservedRemoveDump(decoded:[Array<*>, Array<*>]) {
  return new ObservedRemoveDump(decoded);
}

addExtension({
  Class: ObservedRemoveDump,
  type: 0x92,
  write: writeObservedRemoveDump,
  read: readObservedRemoveDump,
});

export class PeerEvent {
  constructor(type:string, args:Array<any>) {
    this.type = type;
    this.args = args;
  }
  declare type:string;
  declare args: Array<any>;
}

function writePeerEvent(encoded: PeerEvent) {
  return [encoded.type, encoded.args];
}

function readPeerEvent(decoded:[string, Array<any>]) {
  return new PeerEvent(decoded[0], decoded[1]);
}

addExtension({
  Class: PeerEvent,
  type: 0x93,
  write: writePeerEvent,
  read: readPeerEvent,
});

export class Close {
  constructor(code:number, message:string) {
    this.code = code;
    this.message = message;
  }
  declare code: number;
  declare message: string;
}

function writeClose(encoded: Close) {
  return [encoded.code, encoded.message];
}

function readClose(decoded:[number, string]) {
  return new Close(decoded[0], decoded[1]);
}

addExtension({
  Class: Close,
  type: 0x94,
  write: writeClose,
  read: readClose,
});
