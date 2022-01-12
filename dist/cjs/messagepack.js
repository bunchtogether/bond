"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pong = exports.Ping = exports.PeerEvent = exports.ObservedRemoveDump = exports.Close = void 0;

var _msgpackr = require("msgpackr");

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
//# sourceMappingURL=messagepack.js.map