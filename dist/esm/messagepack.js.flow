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
