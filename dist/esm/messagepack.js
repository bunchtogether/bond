import { addExtension } from 'msgpackr';
export class Ping {
  constructor(timestamp) {
    this.timestamp = timestamp;
  }

}

function writePing(encoded) {
  return encoded.timestamp;
}

function readPing(decoded) {
  return new Ping(decoded);
}

addExtension({
  Class: Ping,
  type: 0x1,
  write: writePing,
  read: readPing
});
export class Pong {
  constructor(timestamp, wallclock) {
    this.timestamp = timestamp;
    this.wallclock = wallclock;
  }

}

function writePong(encoded) {
  return [encoded.timestamp, encoded.wallclock];
}

function readPong(decoded) {
  return new Pong(decoded[0], decoded[1]);
}

addExtension({
  Class: Pong,
  type: 0x2,
  write: writePong,
  read: readPong
});
export class ObservedRemoveDump {
  constructor(queue) {
    this.queue = queue;
  }

}

function writeObservedRemoveDump(encoded) {
  return encoded.queue;
}

function readObservedRemoveDump(decoded) {
  return new ObservedRemoveDump(decoded);
}

addExtension({
  Class: ObservedRemoveDump,
  type: 0x3,
  write: writeObservedRemoveDump,
  read: readObservedRemoveDump
});
//# sourceMappingURL=messagepack.js.map