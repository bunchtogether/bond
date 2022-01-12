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
  type: 0x90,
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
  type: 0x91,
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
  type: 0x92,
  write: writeObservedRemoveDump,
  read: readObservedRemoveDump
});
export class PeerEvent {
  constructor(type, args) {
    this.type = type;
    this.args = args;
  }

}

function writePeerEvent(encoded) {
  return [encoded.type, encoded.args];
}

function readPeerEvent(decoded) {
  return new PeerEvent(decoded[0], decoded[1]);
}

addExtension({
  Class: PeerEvent,
  type: 0x93,
  write: writePeerEvent,
  read: readPeerEvent
});
export class Close {
  constructor(code, message) {
    this.code = code;
    this.message = message;
  }

}

function writeClose(encoded) {
  return [encoded.code, encoded.message];
}

function readClose(decoded) {
  return new Close(decoded[0], decoded[1]);
}

addExtension({
  Class: Close,
  type: 0x94,
  write: writeClose,
  read: readClose
});
//# sourceMappingURL=messagepack.js.map