"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pong = exports.Ping = exports.PeerEvent = exports.ObservedRemoveDump = exports.MultipartContainer = exports.MergeChunksPromise = exports.Close = void 0;

var _msgpackr = require("msgpackr");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Ping = /*#__PURE__*/_createClass(function Ping(timestamp) {
  _classCallCheck(this, Ping);

  this.timestamp = timestamp;
});

exports.Ping = Ping;

function writePing(encoded) {
  return encoded.timestamp;
}

function readPing(decoded) {
  return new Ping(decoded);
}

(0, _msgpackr.addExtension)({
  Class: Ping,
  type: 0x90,
  write: writePing,
  read: readPing
});

var Pong = /*#__PURE__*/_createClass(function Pong(timestamp, wallclock) {
  _classCallCheck(this, Pong);

  this.timestamp = timestamp;
  this.wallclock = wallclock;
});

exports.Pong = Pong;

function writePong(encoded) {
  return [encoded.timestamp, encoded.wallclock];
}

function readPong(decoded) {
  return new Pong(decoded[0], decoded[1]);
}

(0, _msgpackr.addExtension)({
  Class: Pong,
  type: 0x91,
  write: writePong,
  read: readPong
});

var ObservedRemoveDump = /*#__PURE__*/_createClass(function ObservedRemoveDump(queue) {
  _classCallCheck(this, ObservedRemoveDump);

  this.queue = queue;
});

exports.ObservedRemoveDump = ObservedRemoveDump;

function writeObservedRemoveDump(encoded) {
  return encoded.queue;
}

function readObservedRemoveDump(decoded) {
  return new ObservedRemoveDump(decoded);
}

(0, _msgpackr.addExtension)({
  Class: ObservedRemoveDump,
  type: 0x92,
  write: writeObservedRemoveDump,
  read: readObservedRemoveDump
});

var PeerEvent = /*#__PURE__*/_createClass(function PeerEvent(type, args) {
  _classCallCheck(this, PeerEvent);

  this.type = type;
  this.args = args;
});

exports.PeerEvent = PeerEvent;

function writePeerEvent(encoded) {
  return [encoded.type, encoded.args];
}

function readPeerEvent(decoded) {
  return new PeerEvent(decoded[0], decoded[1]);
}

(0, _msgpackr.addExtension)({
  Class: PeerEvent,
  type: 0x93,
  write: writePeerEvent,
  read: readPeerEvent
});

var Close = /*#__PURE__*/_createClass(function Close(code, message) {
  _classCallCheck(this, Close);

  this.code = code;
  this.message = message;
});

exports.Close = Close;

function writeClose(encoded) {
  return [encoded.code, encoded.message];
}

function readClose(decoded) {
  return new Close(decoded[0], decoded[1]);
}

(0, _msgpackr.addExtension)({
  Class: Close,
  type: 0x94,
  write: writeClose,
  read: readClose
});
var incrementedChunkId = Math.random() * 4294967296 >>> 0;

var MergeChunksPromise = /*#__PURE__*/function (_Promise, _Symbol$species, _Symbol$toStringTag) {
  _inherits(MergeChunksPromise, _Promise);

  var _super = _createSuper(MergeChunksPromise);

  function MergeChunksPromise(timeoutDuration) {
    var _this;

    _classCallCheck(this, MergeChunksPromise);

    var chunkCallbacks = [];
    _this = _super.call(this, function (resolve, reject) {
      var id;
      var merged;
      var bytesReceived = 0;

      var timeoutHandler = function timeoutHandler() {
        reject(new Error("MultipartContainer chunk timeout error after ".concat(timeoutDuration, "ms")));
      };

      var timeout = setTimeout(timeoutHandler, timeoutDuration);

      var addChunk = function addChunk(multipartContainer) {
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
    _this.chunkCallbacks = chunkCallbacks;
    return _this;
  }

  _createClass(MergeChunksPromise, [{
    key: "push",
    value: function push(multipartContainer) {
      var _iterator = _createForOfIteratorHelper(this.chunkCallbacks),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var chunkCallback = _step.value;
          chunkCallback(multipartContainer);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    } // $FlowFixMe

  }, {
    key: _Symbol$toStringTag,
    get: // $FlowFixMe
    function get() {
      return 'MergeChunksPromise';
    }
  }], [{
    key: _Symbol$species,
    get: function get() {
      return Promise;
    }
  }]);

  return MergeChunksPromise;
}( /*#__PURE__*/_wrapNativeSuper(Promise), Symbol.species, Symbol.toStringTag);

exports.MergeChunksPromise = MergeChunksPromise;

var MultipartContainer = /*#__PURE__*/_createClass(function MultipartContainer(id, position, length, buffer) {
  _classCallCheck(this, MultipartContainer);

  this.id = id;
  this.position = position;
  this.length = length;
  this.buffer = buffer;
});

exports.MultipartContainer = MultipartContainer;

_defineProperty(MultipartContainer, "chunk", void 0);

_defineProperty(MultipartContainer, "getMergeChunksPromise", void 0);

MultipartContainer.chunk = function (buffer, size) {
  var chunks = [];

  for (var i = 0; i * size < buffer.length; i += 1) {
    var slice = buffer.slice(i * size, (i + 1) * size);
    chunks.push((0, _msgpackr.pack)(new MultipartContainer(incrementedChunkId, i * size, buffer.length, slice)));
  }

  incrementedChunkId += 1;

  if (incrementedChunkId > 4294967294) {
    incrementedChunkId = 0;
  }

  return chunks;
};

MultipartContainer.getMergeChunksPromise = function (timeoutDuration) {
  return new MergeChunksPromise(timeoutDuration);
};

function decodeMultipartContainer(buffer) {
  var id = buffer.readUInt32BE(0);
  var position = buffer.readUInt32BE(4);
  var length = buffer.readUInt32BE(8);
  return new MultipartContainer(id, position, length, buffer.slice(12));
}

function encodeMultipartContainer(multipartContainer) {
  var buffer = Buffer.allocUnsafe(multipartContainer.buffer.length + 12);
  buffer.writeUInt32BE(multipartContainer.id, 0);
  buffer.writeUInt32BE(multipartContainer.position, 4);
  buffer.writeUInt32BE(multipartContainer.length, 8);
  multipartContainer.buffer.copy(buffer, 12);
  return buffer;
}

(0, _msgpackr.addExtension)({
  Class: MultipartContainer,
  type: 0x95,
  pack: encodeMultipartContainer,
  unpack: decodeMultipartContainer
});
//# sourceMappingURL=messagepack.js.map