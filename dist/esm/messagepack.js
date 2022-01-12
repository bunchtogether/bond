function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { pack, addExtension } from 'msgpackr';
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
let incrementedChunkId = Math.random() * 4294967296 >>> 0;
export class MergeChunksPromise extends Promise {
  constructor(timeoutDuration) {
    const chunkCallbacks = [];
    super((resolve, reject) => {
      let id;
      let merged;
      let bytesReceived = 0;

      const timeoutHandler = () => {
        reject(new Error(`MultipartContainer chunk timeout error after ${timeoutDuration}ms`));
      };

      let timeout = setTimeout(timeoutHandler, timeoutDuration);

      const addChunk = multipartContainer => {
        if (typeof id === 'undefined' || typeof merged === 'undefined') {
          id = multipartContainer.id;
          merged = Buffer.alloc(multipartContainer.length);
        } else if (multipartContainer.id !== id) {
          return;
        }

        clearTimeout(timeout);
        multipartContainer.buffer.copy(merged, multipartContainer.position);
        bytesReceived += multipartContainer.buffer.length;

        if (bytesReceived < multipartContainer.length) {
          timeout = setTimeout(timeoutHandler, timeoutDuration);
          return;
        }

        resolve(merged);
      };

      chunkCallbacks.push(addChunk);
    });
    this.chunkCallbacks = chunkCallbacks;
  }

  push(multipartContainer) {
    for (const chunkCallback of this.chunkCallbacks) {
      chunkCallback(multipartContainer);
    }
  } // $FlowFixMe


  static get [Symbol.species]() {
    return Promise;
  } // $FlowFixMe


  get [Symbol.toStringTag]() {
    return 'MergeChunksPromise';
  }

}
export class MultipartContainer {
  constructor(id, position, length, buffer) {
    this.id = id;
    this.position = position;
    this.length = length;
    this.buffer = buffer;
  }

}

_defineProperty(MultipartContainer, "chunk", void 0);

_defineProperty(MultipartContainer, "getMergeChunksPromise", void 0);

MultipartContainer.chunk = (buffer, size) => {
  const chunks = [];

  for (let i = 0; i * size < buffer.length; i += 1) {
    const slice = buffer.slice(i * size, (i + 1) * size);
    chunks.push(pack(new MultipartContainer(incrementedChunkId, i * size, buffer.length, slice)));
  }

  incrementedChunkId += 1;

  if (incrementedChunkId > 4294967294) {
    incrementedChunkId = 0;
  }

  return chunks;
};

MultipartContainer.getMergeChunksPromise = timeoutDuration => new MergeChunksPromise(timeoutDuration);

function decodeMultipartContainer(buffer) {
  const id = buffer.readUInt32BE(0);
  const position = buffer.readUInt32BE(4);
  const length = buffer.readUInt32BE(8);
  return new MultipartContainer(id, position, length, buffer.slice(12));
}

function encodeMultipartContainer(multipartContainer) {
  const buffer = Buffer.allocUnsafe(multipartContainer.buffer.length + 12);
  buffer.writeUInt32BE(multipartContainer.id, 0);
  buffer.writeUInt32BE(multipartContainer.position, 4);
  buffer.writeUInt32BE(multipartContainer.length, 8);
  multipartContainer.buffer.copy(buffer, 12);
  return buffer;
}

addExtension({
  Class: MultipartContainer,
  type: 0x95,
  pack: encodeMultipartContainer,
  unpack: decodeMultipartContainer
});
//# sourceMappingURL=messagepack.js.map