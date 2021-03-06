"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bond = void 0;

var _events = _interopRequireDefault(require("events"));

var _map = _interopRequireDefault(require("observed-remove/map"));

var _simplePeer = _interopRequireDefault(require("simple-peer"));

var _pQueue = _interopRequireDefault(require("p-queue"));

var _msgpackr = require("msgpackr");

var _constants = require("./constants");

var _errors = require("./errors");

var _messagepack = require("./messagepack");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var getSocketMap = function getSocketMap(values) {
  if (typeof values === 'undefined') {
    return new Map();
  }

  return new Map(values.map(function (x) {
    var socketHash = "".concat(x[0], ":").concat(x[1]);
    return [socketHash, {
      socketHash: socketHash,
      socketId: x[0],
      serverId: x[1],
      userId: x[2],
      clientId: x[3],
      sessionId: x[4]
    }];
  }));
};

var getSessionId = function getSessionId(values, clientId) {
  if (typeof values === 'undefined') {
    return false;
  }

  var _iterator = _createForOfIteratorHelper(values),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var x = _step.value;

      if (x[3] === clientId) {
        return x[4] || false;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return false;
};

var getPeerIds = function getPeerIds(values) {
  if (typeof values === 'undefined') {
    return new Set();
  }

  return new Set(values.map(function (x) {
    return x[2];
  }));
};

var getSessionMap = function getSessionMap(socketMap) {
  var map = new Map();

  var _iterator2 = _createForOfIteratorHelper(socketMap.values()),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var socket = _step2.value;
      var clientId = socket.clientId,
          sessionId = socket.sessionId;
      var sessionClientMap = map.get(sessionId);

      if (typeof sessionClientMap === 'undefined') {
        map.set(sessionId, new Map([[clientId, socket]]));
      } else {
        sessionClientMap.set(clientId, socket);
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  return map;
};

var Bond = /*#__PURE__*/function (_EventEmitter) {
  _inherits(Bond, _EventEmitter);

  var _super = _createSuper(Bond);

  function Bond(braidClient, roomId, userId) {
    var _this;

    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    _classCallCheck(this, Bond);

    _this = _super.call(this);
    _this.active = true;
    _this.clientId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    _this.userId = userId;
    _this.roomId = roomId;
    _this.sessionId = false;
    _this.localConnectionsOnly = !!options.localConnectionsOnly;
    var name = "signal/".concat(_this.roomId);
    _this.name = name;
    _this.publishName = "signal/".concat(_this.roomId, "/").concat(_this.clientId.toString(36));
    _this.braidClient = braidClient;
    _this.logger = options.logger || braidClient.logger;
    _this.peerOptions = options.peerOptions;
    _this.socketMap = new Map();
    _this.userIds = new Set();
    _this.peerMap = new Map();
    _this.peerReconnectMap = new Map();
    _this.queueMap = new Map();
    _this.sessionMap = new Map();
    _this.inviteDeclineHandlerMap = new Map();
    _this.requestCallbackMap = new Map();
    _this.signalQueueMap = new Map();
    _this.peerDisconnectTimeoutMap = new Map();
    _this.sessionJoinHandlerMap = new Map();
    _this.sessionJoinRequestMap = new Map();
    _this.data = new _map.default([], {
      bufferPublishing: 0
    });
    _this.sessionClientOffsetMap = new Map();
    _this.preApprovedSessionUserIdSet = new Set();
    _this.peerAddTrackHandlerMap = new Map();
    _this._ready = _this.init(); // eslint-disable-line no-underscore-dangle

    if (typeof options.sessionId === 'string') {
      _this.ready = _this.joinSession(options.sessionId);
    } else {
      _this.ready = _this._ready; // eslint-disable-line no-underscore-dangle
    }

    _this.handleSessionClientJoin = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (clientId) {
        var sessionClientIds = _this.sessionClientIds;

        if (sessionClientIds.size > 1) {
          clearTimeout(_this.leaveSessionAfterLastClientTimeout);
        }

        var interval;

        var _peer; // eslint-disable-line no-underscore-dangle


        var offset = 0;
        var peerIsClosing = false;
        var abortController = new AbortController();
        var abortSignal = abortController.signal;

        var cleanup = function cleanup() {
          abortController.abort();

          _this.removeListener('sessionClientLeave', handleSessionClientLeave);

          if (typeof _peer !== 'undefined') {
            _peer.removeListener('close', handlePeerClose);

            _peer.removeListener('data', handlePeerData);
          }

          _this.data.removeListener('publish', handleDataPublish);

          clearInterval(interval);
        };

        var handlePeerClose = function handlePeerClose() {
          cleanup();

          if (!peerIsClosing && _this.active && _this.sessionClientIds.has(clientId)) {
            _this.handleSessionClientJoin(clientId);
          }
        };

        var handleSessionClientLeave = function handleSessionClientLeave(oldClientId) {
          if (clientId !== oldClientId) {
            return;
          }

          cleanup();
        };

        var handleDataPublish = function handleDataPublish(queue) {
          sendToPeer(new _messagepack.ObservedRemoveDump(queue));
        };

        var sendToPeer = function sendToPeer(unpacked) {
          if (typeof peer === 'undefined') {
            throw new Error('Peer does not exist');
          }

          if (!peer.connected) {
            _this.logger.warn("Unable to send message to client ".concat(clientId, ", connection is closing"));

            return;
          }

          peer.send((0, _msgpackr.pack)(unpacked));
        };

        var mergeChunkPromises = new Map();

        var handleMultipartContainer = /*#__PURE__*/function () {
          var _ref2 = _asyncToGenerator(function* (multipartContainer) {
            var existingMergeChunksPromise = mergeChunkPromises.get(multipartContainer.id);

            if (typeof existingMergeChunksPromise !== 'undefined') {
              existingMergeChunksPromise.push(multipartContainer);
              return;
            }

            var mergeChunksPromise = _messagepack.MultipartContainer.getMergeChunksPromise(60000);

            mergeChunksPromise.push(multipartContainer);
            mergeChunkPromises.set(multipartContainer.id, mergeChunksPromise);

            try {
              var packed = yield mergeChunksPromise;
              handlePeerData(packed);
            } catch (error) {
              if (error.stack) {
                _this.logger.error('Unable to merge multipart message chunks:');

                error.stack.split('\n').forEach(function (line) {
                  return _this.logger.error("\t".concat(line));
                });
              } else {
                _this.logger.error("Unable to merge multipart message chunks: ".concat(error.message));
              }
            } finally {
              mergeChunkPromises.delete(multipartContainer.id);
            }
          });

          return function handleMultipartContainer(_x2) {
            return _ref2.apply(this, arguments);
          };
        }();

        var handlePeerData = function handlePeerData(packed) {
          var message = (0, _msgpackr.unpack)(packed);

          if (message instanceof _messagepack.Ping) {
            sendToPeer(new _messagepack.Pong(message.timestamp, Date.now()));
          } else if (message instanceof _messagepack.Pong) {
            offset = Date.now() - message.wallclock - (performance.now() - message.timestamp) / 2;

            _this.sessionClientOffsetMap.set(clientId, offset);
          } else if (message instanceof _messagepack.ObservedRemoveDump) {
            _this.data.process(message.queue);
          } else if (message instanceof _messagepack.PeerEvent) {
            var _this2;

            (_this2 = _this).emit.apply(_this2, [message.type].concat(_toConsumableArray(message.args)));
          } else if (message instanceof _messagepack.Close) {
            _this.logger.info("Client ".concat(clientId, " closing with code ").concat(message.code, ": ").concat(message.message));

            _this.peerMap.delete(clientId);

            peerIsClosing = true;
          } else if (message instanceof _messagepack.MultipartContainer) {
            handleMultipartContainer(message);
          }
        };

        _this.addListener('sessionClientLeave', handleSessionClientLeave);

        if (!_this.isConnectedToClient(clientId)) {
          yield new Promise(function (resolve) {
            var handleConnect = function handleConnect(_ref3) {
              var newClientId = _ref3.clientId;

              if (newClientId !== clientId) {
                return;
              }

              _this.removeListener('connect', handleConnect);

              abortSignal.removeEventListener('abort', handleAbort);
              resolve();
            };

            var handleAbort = function handleAbort() {
              _this.removeListener('connect', handleConnect);

              abortSignal.removeEventListener('abort', handleAbort);
              resolve();
            };

            _this.addListener('connect', handleConnect);

            abortSignal.addEventListener('abort', handleAbort);
          });

          if (abortSignal.aborted) {
            return;
          }
        }

        var peer = _this.peerMap.get(clientId);

        _peer = peer;

        if (typeof peer === 'undefined') {
          throw new Error('Peer does not exist');
        }

        peer.addListener('close', handlePeerClose);
        peer.addListener('data', handlePeerData);
        interval = setInterval(function () {
          peer.send((0, _msgpackr.pack)(new _messagepack.Ping(performance.now())));
        }, 1000);
        peer.send((0, _msgpackr.pack)(new _messagepack.Ping(performance.now())));

        _this.data.addListener('publish', handleDataPublish);

        handleDataPublish(_this.data.dump());
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }();

    _this.handleSocketJoin = function (socketData) {
      var clientId = socketData.clientId;

      if (clientId === _this.clientId) {
        return;
      }

      if (_this.peerDisconnectTimeoutMap.has(clientId)) {
        _this.logger.info("Clearing client ".concat(clientId, " disconnect timeout after socket join"));

        clearTimeout(_this.peerDisconnectTimeoutMap.get(clientId));

        _this.peerDisconnectTimeoutMap.delete(clientId);
      }

      _this.addToQueue(clientId, function () {
        return _this.connectToPeer(socketData);
      });
    };

    _this.handleSocketLeave = function (socketData) {
      var clientId = socketData.clientId;

      if (clientId === _this.clientId) {
        return;
      }

      clearTimeout(_this.peerDisconnectTimeoutMap.get(clientId));

      if (_this.active) {
        _this.peerDisconnectTimeoutMap.set(clientId, setTimeout(function () {
          _this.peerDisconnectTimeoutMap.delete(clientId);

          _this.addToQueue(clientId, function () {
            return _this.disconnectFromPeer(clientId);
          });
        }, 15000));
      } else {
        _this.addToQueue(clientId, function () {
          return _this.disconnectFromPeer(clientId);
        });
      }
    };

    _this.handleSessionClientLeave = function () {
      var sessionClientIds = _this.sessionClientIds;

      if (sessionClientIds.size > 1) {
        return;
      }

      _this.leaveSessionAfterLastClientTimeout = setTimeout( /*#__PURE__*/_asyncToGenerator(function* () {
        try {
          yield _this.leaveSession();
        } catch (error) {
          _this.logger.error('Unable to leave session after timeout when last session closed');

          _this.logger.errorStack(error);
        }
      }), 5000);
    };

    _this.handleSession = function () {
      _this.data.clear();

      _this.sessionClientOffsetMap.clear();
    };

    _this.addListener('socketJoin', _this.handleSocketJoin);

    _this.addListener('socketLeave', _this.handleSocketLeave);

    _this.addListener('sessionClientJoin', _this.handleSessionClientJoin);

    _this.addListener('sessionClientLeave', _this.handleSessionClientLeave);

    _this.addListener('session', _this.handleSession);

    _this.handleBraidSet = function (key, values) {
      if (key !== name) {
        return;
      }

      _this.active = true;
      var oldSessionId = _this.sessionId;
      var newSessionId = getSessionId(values, _this.clientId);
      var oldSocketMap = _this.socketMap;
      var newSocketMap = getSocketMap(values);
      var oldUserIds = _this.userIds;
      var newUserIds = getPeerIds(values);
      var oldSessionMap = _this.sessionMap;
      var newSessionMap = getSessionMap(newSocketMap);
      var oldLocalSessionSocketMap = typeof oldSessionId === 'string' ? oldSessionMap.get(oldSessionId) || new Map() : new Map();
      var newLocalSessionSocketMap = typeof newSessionId === 'string' ? newSessionMap.get(newSessionId) || new Map() : new Map();
      _this.sessionId = newSessionId;
      _this.userIds = newUserIds;
      _this.socketMap = newSocketMap;
      _this.sessionMap = newSessionMap;

      if (newSessionId !== oldSessionId) {
        _this.emit('session', newSessionId);
      }

      var _iterator3 = _createForOfIteratorHelper(oldSocketMap),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _step3$value = _slicedToArray(_step3.value, 2),
              socketHash = _step3$value[0],
              socketData = _step3$value[1];

          if (!newSocketMap.has(socketHash)) {
            _this.emit('socketLeave', socketData);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      var _iterator4 = _createForOfIteratorHelper(newSocketMap),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var _step4$value = _slicedToArray(_step4.value, 2),
              _socketHash = _step4$value[0],
              _socketData = _step4$value[1];

          if (!oldSocketMap.has(_socketHash)) {
            _this.emit('socketJoin', _socketData);
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      var _iterator5 = _createForOfIteratorHelper(oldUserIds),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var peerUserId = _step5.value;

          if (!newUserIds.has(peerUserId)) {
            _this.emit('leave', peerUserId);
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }

      var _iterator6 = _createForOfIteratorHelper(newUserIds),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var _peerUserId = _step6.value;

          if (!oldUserIds.has(_peerUserId)) {
            _this.emit('join', _peerUserId);
          }
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }

      var _iterator7 = _createForOfIteratorHelper(oldLocalSessionSocketMap),
          _step7;

      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var _step7$value = _slicedToArray(_step7.value, 2),
              clientId = _step7$value[0],
              _socketData2 = _step7$value[1];

          if (clientId === _this.clientId) {
            continue;
          }

          if (!newLocalSessionSocketMap.has(clientId)) {
            _this.emit('sessionClientLeave', clientId, _socketData2);
          }
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }

      var _iterator8 = _createForOfIteratorHelper(newLocalSessionSocketMap),
          _step8;

      try {
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          var _step8$value = _slicedToArray(_step8.value, 2),
              _clientId = _step8$value[0],
              _socketData3 = _step8$value[1];

          if (_clientId === _this.clientId) {
            continue;
          }

          if (!oldLocalSessionSocketMap.has(_clientId)) {
            _this.emit('sessionClientJoin', _clientId, _socketData3);
          }
        }
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }

      var _iterator9 = _createForOfIteratorHelper(oldSessionMap),
          _step9;

      try {
        for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
          var _step9$value = _slicedToArray(_step9.value, 2),
              sessionId = _step9$value[0],
              oldSessionSocketMap = _step9$value[1];

          var newSessionSocketMap = newSessionMap.get(sessionId);

          if (typeof newSessionSocketMap === 'undefined') {
            var _iterator11 = _createForOfIteratorHelper(oldSessionSocketMap.values()),
                _step11;

            try {
              for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
                var _socketData4 = _step11.value;

                _this.emit('sessionLeave', _socketData4);
              }
            } catch (err) {
              _iterator11.e(err);
            } finally {
              _iterator11.f();
            }
          } else {
            var _iterator12 = _createForOfIteratorHelper(oldSessionSocketMap),
                _step12;

            try {
              for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
                var _step12$value = _slicedToArray(_step12.value, 2),
                    _socketHash2 = _step12$value[0],
                    _socketData5 = _step12$value[1];

                if (!newSessionSocketMap.has(_socketHash2)) {
                  _this.emit('sessionLeave', _socketData5);
                }
              }
            } catch (err) {
              _iterator12.e(err);
            } finally {
              _iterator12.f();
            }
          }
        }
      } catch (err) {
        _iterator9.e(err);
      } finally {
        _iterator9.f();
      }

      var _iterator10 = _createForOfIteratorHelper(newSessionMap),
          _step10;

      try {
        for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
          var _step10$value = _slicedToArray(_step10.value, 2),
              _sessionId = _step10$value[0],
              _newSessionSocketMap = _step10$value[1];

          var _oldSessionSocketMap = oldSessionMap.get(_sessionId);

          if (typeof _oldSessionSocketMap === 'undefined') {
            var _iterator13 = _createForOfIteratorHelper(_newSessionSocketMap.values()),
                _step13;

            try {
              for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
                var _socketData6 = _step13.value;

                _this.emit('sessionJoin', _socketData6);
              }
            } catch (err) {
              _iterator13.e(err);
            } finally {
              _iterator13.f();
            }
          } else {
            var _iterator14 = _createForOfIteratorHelper(_newSessionSocketMap),
                _step14;

            try {
              for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
                var _step14$value = _slicedToArray(_step14.value, 2),
                    _socketHash3 = _step14$value[0],
                    _socketData7 = _step14$value[1];

                if (!_oldSessionSocketMap.has(_socketHash3)) {
                  _this.emit('sessionJoin', _socketData7);
                }
              }
            } catch (err) {
              _iterator14.e(err);
            } finally {
              _iterator14.f();
            }
          }
        }
      } catch (err) {
        _iterator10.e(err);
      } finally {
        _iterator10.f();
      }
    };

    _this.handleBraidClose = function () {
      _this.reset();
    };

    _this.handleBraidCloseRequested = function () {
      _this.close();
    };

    _this.handleBraidReconnect = function (isReconnecting) {
      if (!isReconnecting) {
        return;
      }

      var startedSessionId = _this.startedSessionId;
      var joinedSessionId = _this.joinedSessionId;

      var handleInitialized = function handleInitialized() {
        if (typeof startedSessionId === 'string') {
          _this.logger.info("Restarting session ".concat(startedSessionId));

          _this.startSession(startedSessionId).catch(function (error) {
            _this.logger.error("Unable to restart session ".concat(startedSessionId, " after reconnect"));

            _this.logger.errorStack(error);
          });
        }

        if (typeof joinedSessionId === 'string') {
          _this.logger.info("Rejoining session ".concat(joinedSessionId));

          _this.joinSession(joinedSessionId).catch(function (error) {
            _this.logger.error("Unable to rejoin session ".concat(joinedSessionId, " after reconnect"));

            _this.logger.errorStack(error);
          });
        }

        _this.braidClient.removeListener('initialized', handleInitialized);

        _this.braidClient.removeListener('close', handleClose);

        _this.braidClient.removeListener('error', handleError);
      };

      var handleClose = function handleClose() {
        _this.braidClient.removeListener('initialized', handleInitialized);

        _this.braidClient.removeListener('close', handleClose);

        _this.braidClient.removeListener('error', handleError);
      };

      var handleError = function handleError(error) {
        if (typeof startedSessionId === 'string') {
          _this.logger.error("Unable to restart session ".concat(startedSessionId, " after reconnect"));

          _this.logger.errorStack(error);
        }

        _this.braidClient.removeListener('initialized', handleInitialized);

        _this.braidClient.removeListener('close', handleClose);

        _this.braidClient.removeListener('error', handleError);
      };

      _this.braidClient.addListener('initialized', handleInitialized);

      _this.braidClient.addListener('close', handleClose);

      _this.braidClient.addListener('error', handleError);
    };

    _this.braidClient.data.addListener('set', _this.handleBraidSet);

    _this.braidClient.addListener('close', _this.handleBraidClose);

    _this.braidClient.addListener('closeRequested', _this.handleBraidCloseRequested);

    _this.braidClient.addListener('reconnect', _this.handleBraidReconnect);

    return _this;
  }

  _createClass(Bond, [{
    key: "sessionClientMap",
    get: function get() {
      var sessionId = this.sessionId;

      if (typeof sessionId !== 'string') {
        return new Map();
      }

      var sessionClientMap = this.sessionMap.get(sessionId);

      if (typeof sessionClientMap === 'undefined') {
        return new Map();
      }

      return sessionClientMap;
    }
  }, {
    key: "sessionClientIds",
    get: function get() {
      return new Set(this.sessionClientMap.keys());
    }
  }, {
    key: "init",
    value: function () {
      var _init = _asyncToGenerator(function* () {
        var _this3 = this;

        var promise = new Promise(function (resolve, reject) {
          var handleClose = function handleClose() {
            _this3.removeListener('close', handleClose);

            _this3.braidClient.data.removeListener('set', handleValue);

            _this3.braidClient.removeListener('error', handleError);

            reject(new Error('Closed before initialization completed'));
          };

          var handleValue = function handleValue(key, value) {
            if (key !== _this3.name) {
              return;
            }

            if (typeof value === 'undefined') {
              return;
            }

            _this3.removeListener('close', handleClose);

            _this3.braidClient.data.removeListener('set', handleValue);

            _this3.braidClient.removeListener('error', handleError);

            resolve();
          };

          var handleError = function handleError(error) {
            _this3.removeListener('close', handleClose);

            _this3.braidClient.data.removeListener('set', handleValue);

            _this3.braidClient.removeListener('error', handleError);

            reject(error);
          };

          _this3.addListener('close', handleClose);

          _this3.braidClient.data.addListener('set', handleValue);

          _this3.braidClient.addListener('error', handleError);

          handleValue(_this3.name, _this3.braidClient.data.get(_this3.name));
        });

        try {
          yield Promise.all([this.braidClient.subscribe(this.name), this.braidClient.addServerEventListener(this.name, this.handleMessage.bind(this))]);

          if (!this.active) {
            return;
          }

          yield promise;

          if (!this.active) {
            return;
          }

          yield this.braidClient.startPublishing(this.publishName);
        } catch (error) {
          this.braidClient.logger.error("Unable to join ".concat(this.roomId));
          throw error;
        }
      });

      function init() {
        return _init.apply(this, arguments);
      }

      return init;
    }()
  }, {
    key: "addToQueue",
    value: function addToQueue(queueId, func) {
      var _this4 = this;

      var queue = this.queueMap.get(queueId);

      if (typeof queue !== 'undefined') {
        return queue.add(func);
      }

      var newQueue = new _pQueue.default({
        concurrency: 1
      });
      var promise = newQueue.add(func);
      this.queueMap.set(queueId, newQueue);
      newQueue.on('idle', function () {
        _this4.queueMap.delete(queueId);
      });
      return promise;
    }
  }, {
    key: "publish",
    value: function () {
      var _publish = _asyncToGenerator(function* (type, value) {
        var _this5 = this;

        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        yield this._ready; // eslint-disable-line no-underscore-dangle

        var timeoutDuration = typeof options.timeoutDuration === 'number' ? options.timeoutDuration : 5000;
        var CustomError = typeof options.CustomError === 'function' ? options.CustomError : _errors.RequestError;
        var requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        return new Promise(function (resolve, reject) {
          var handleClose = function handleClose() {
            _this5.requestCallbackMap.delete(requestId);

            clearTimeout(timeout);

            _this5.removeListener('close', handleClose);

            reject(new _errors.ClientClosedError("Client closed before ".concat(type, " request completed")));
          };

          var timeout = setTimeout(function () {
            _this5.requestCallbackMap.delete(requestId);

            _this5.removeListener('close', handleClose);

            reject(new _errors.RequestTimeoutError("".concat(type, " requested timed out after ").concat(timeoutDuration, "ms")));
          }, timeoutDuration);

          var handleResponse = function handleResponse(success, code, text) {
            _this5.requestCallbackMap.delete(requestId);

            clearTimeout(timeout);

            _this5.removeListener('close', handleClose);

            if (success) {
              resolve({
                code: code,
                text: text
              });
              return;
            }

            reject(new CustomError(text, code));
          };

          _this5.addListener('close', handleClose);

          _this5.requestCallbackMap.set(requestId, handleResponse);

          _this5.braidClient.publish(_this5.publishName, {
            requestId: requestId,
            type: type,
            value: value
          });
        });
      });

      function publish(_x3, _x4) {
        return _publish.apply(this, arguments);
      }

      return publish;
    }()
  }, {
    key: "isConnectedToClient",
    value: function isConnectedToClient(clientId) {
      var peer = this.peerMap.get(clientId);

      if (typeof peer === 'undefined') {
        return false;
      }

      return !!peer.connected;
    }
  }, {
    key: "connectToPeer",
    value: function () {
      var _connectToPeer = _asyncToGenerator(function* (socket) {
        var _this6 = this;

        var userId = socket.userId,
            serverId = socket.serverId,
            socketId = socket.socketId,
            clientId = socket.clientId,
            socketHash = socket.socketHash;
        var reconnectCount = this.peerReconnectMap.get(clientId) || 0;
        var reconnectDelay = reconnectCount > 5 ? 30000 : 1000 * (reconnectCount * reconnectCount);

        if (reconnectDelay > 0) {
          this.logger.info("Delaying connect by ".concat(Math.round(reconnectDelay / 1000), " ").concat(reconnectDelay === 1000 ? 'second' : 'seconds', " on attempt ").concat(reconnectCount));
          yield new Promise(function (resolve) {
            var timeout = setTimeout(function () {
              _this6.removeListener('close', handleClose);

              _this6.removeListener('socketLeave', handleSocketLeave);

              resolve();
            }, reconnectDelay);

            var handleClose = function handleClose() {
              clearTimeout(timeout);

              _this6.removeListener('close', handleClose);

              _this6.removeListener('socketLeave', handleSocketLeave);

              resolve();
            };

            var handleSocketLeave = function handleSocketLeave(_ref5) {
              var oldSocketHash = _ref5.socketHash;

              if (socketHash !== oldSocketHash) {
                return;
              }

              clearTimeout(timeout);

              _this6.removeListener('close', handleClose);

              _this6.removeListener('socketLeave', handleSocketLeave);

              resolve();
            };

            _this6.addListener('close', handleClose);

            _this6.addListener('socketLeave', handleSocketLeave);
          });

          if (!this.socketMap.has(socketHash)) {
            return;
          }
        }

        var existingPeer = this.peerMap.get(clientId);
        var options = Object.assign({}, {
          initiator: clientId > this.clientId
        }, this.peerOptions);

        if (this.localConnectionsOnly) {
          options.config = {
            iceServers: []
          };
        }

        var peer = existingPeer || new _simplePeer.default(options);
        this.peerMap.set(clientId, peer);
        this.peerReconnectMap.set(clientId, reconnectCount + 1);
        this.emit('peer', {
          clientId: clientId,
          peer: peer
        });

        var addPeerListeners = function addPeerListeners() {
          _this6.peerReconnectMap.set(clientId, 0);

          var cleanup = function cleanup() {
            peer.removeListener('signal', handleSignal);
            peer.removeListener('stream', handleStream);
            peer.removeListener('error', handlePeerError);
            peer.removeListener('close', handlePeerClose);
            peer.removeListener('peerReconnect', handlePeerReconnect);
          };

          var handleSignal = /*#__PURE__*/function () {
            var _ref6 = _asyncToGenerator(function* (data) {
              try {
                yield _this6.publish(_constants.SIGNAL, {
                  serverId: serverId,
                  socketId: socketId,
                  data: data
                }, {
                  CustomError: _errors.SignalError
                });
              } catch (error) {
                _this6.logger.error("Unable to signal user ".concat(userId, " client ").concat(clientId, " closed"));

                _this6.logger.errorStack(error);
              }
            });

            return function handleSignal(_x6) {
              return _ref6.apply(this, arguments);
            };
          }();

          var handleStream = function handleStream(stream) {
            if (!_this6.sessionClientIds.has(clientId)) {
              _this6.logger.error("Received an unexpected stream from non-session user ".concat(userId, " client ").concat(clientId));

              stream.getTracks().forEach(function (track) {
                track.stop();
                track.dispatchEvent(new Event('stop'));
              });
              return;
            }

            _this6.emit('stream', {
              stream: stream,
              userId: userId,
              serverId: serverId,
              socketId: socketId,
              clientId: clientId
            });
          };

          var handlePeerClose = function handlePeerClose() {
            _this6.logger.info("Disconnected from user ".concat(userId, " client ").concat(clientId));

            cleanup();

            _this6.emit('disconnect', {
              userId: userId,
              serverId: serverId,
              socketId: socketId,
              clientId: clientId
            });

            if (_this6.active && _this6.peerMap.has(clientId)) {
              _this6.peerMap.delete(clientId);

              _this6.connectToPeer(socket);

              _this6.logger.warn("Reconnecting to user ".concat(userId, " client ").concat(clientId));
            }
          };

          var handlePeerError = function handlePeerError(error) {
            _this6.logger.error("Error in connection to user ".concat(userId, " client ").concat(clientId));

            _this6.logger.errorStack(error);

            _this6.emit('peerError', {
              userId: userId,
              serverId: serverId,
              socketId: socketId,
              clientId: clientId,
              error: error
            });
          };

          var handlePeerReconnect = function handlePeerReconnect() {
            _this6.logger.info("Reconnected to user ".concat(userId, " client ").concat(clientId));

            cleanup();
          };

          peer.addListener('signal', handleSignal);
          peer.addListener('stream', handleStream);
          peer.addListener('close', handlePeerClose);
          peer.addListener('error', handlePeerError);
          peer.addListener('peerReconnect', handlePeerReconnect);
        };

        if (peer.connected) {
          peer.emit('peerReconnect');
          addPeerListeners();
          this.emit('connect', {
            userId: userId,
            clientId: clientId,
            serverId: serverId,
            socketId: socketId,
            socketHash: socketHash,
            peer: peer
          });
          return;
        }

        yield new Promise(function (resolve) {
          var cleanup = function cleanup() {
            clearTimeout(timeout);
            peer.removeListener('error', handlePeerError);
            peer.removeListener('close', handlePeerClose);
            peer.removeListener('connect', handleConnect);
            peer.removeListener('signal', handleSignal);

            _this6.removeListener('close', handleClose);

            _this6.removeListener('socketLeave', handleSocketLeave);
          };

          var timeout = setTimeout(function () {
            cleanup();
            resolve();
          }, 5000);

          var handleConnect = function handleConnect() {
            cleanup();
            addPeerListeners();

            _this6.emit('connect', {
              userId: userId,
              clientId: clientId,
              serverId: serverId,
              socketId: socketId,
              socketHash: socketHash,
              peer: peer
            });

            resolve();
          };

          var handleSignal = /*#__PURE__*/function () {
            var _ref7 = _asyncToGenerator(function* (data) {
              if (_this6.localConnectionsOnly) {
                if (data.type === 'candidate') {
                  var candidate = data.candidate.candidate;
                  var addressParts = candidate.split(' ');

                  if (addressParts[4] !== '127.0.0.1' && addressParts[4] !== '::1') {
                    addressParts[4] = '127.0.0.1';
                    data.candidate.candidate = addressParts.join(' '); // eslint-disable-line no-param-reassign
                  }
                } else if (data.type === 'answer' || data.type === 'offer') {
                  data.sdp = data.sdp.replace(/(a=candidate[^\s]+?\s[^\s]+?\s[^\s]+?\s[^\s]+?\s)([^\s]+?\s)(.*?\r?\n)/g, '$1127.0.0.1 $3'); // eslint-disable-line no-param-reassign
                }
              }

              try {
                yield _this6.publish(_constants.SIGNAL, {
                  serverId: serverId,
                  socketId: socketId,
                  data: data
                }, {
                  CustomError: _errors.SignalError
                });
              } catch (error) {
                if (error instanceof _errors.SignalError && error.code === 404) {
                  _this6.logger.error("Unable to signal user ".concat(userId, ", client ").concat(clientId, ", client does not exist"));

                  cleanup();
                  resolve();
                } else {
                  _this6.logger.error("Unable to signal user ".concat(userId, ", client ").concat(clientId));

                  _this6.logger.errorStack(error);
                }
              }
            });

            return function handleSignal(_x7) {
              return _ref7.apply(this, arguments);
            };
          }();

          var handleClose = function handleClose() {
            cleanup();
            resolve();
          };

          var handlePeerClose = function handlePeerClose() {
            _this6.logger.info("Connection to user ".concat(userId, " client ").concat(clientId, " closed"));

            cleanup();

            if (_this6.peerMap.has(clientId)) {
              _this6.peerMap.delete(clientId);

              _this6.connectToPeer(socket);

              _this6.logger.warn("Reconnecting to user ".concat(userId, " client ").concat(clientId));
            }

            resolve();
          };

          var handlePeerError = function handlePeerError(error) {
            cleanup();

            _this6.logger.error("Error connecting to ".concat(userId));

            _this6.logger.errorStack(error);

            _this6.emit('peerError', {
              userId: userId,
              serverId: serverId,
              socketId: socketId,
              clientId: clientId,
              error: error
            });

            resolve();
          };

          var handleSocketLeave = function handleSocketLeave(_ref8) {
            var oldSocketHash = _ref8.socketHash;

            if (socketHash !== oldSocketHash) {
              return;
            }

            cleanup();

            _this6.logger.warn("Unable to connect to user ".concat(userId, " client ").concat(clientId, ", socket closed before connection was completed"));

            resolve();
          };

          peer.addListener('error', handlePeerError);
          peer.addListener('close', handlePeerClose);
          peer.addListener('connect', handleConnect);
          peer.addListener('signal', handleSignal);

          _this6.addListener('close', handleClose);

          _this6.addListener('socketLeave', handleSocketLeave);

          var signalQueue = _this6.signalQueueMap.get(clientId);

          if (Array.isArray(signalQueue)) {
            while (signalQueue.length > 0) {
              var data = signalQueue.shift();
              peer.signal(data);
            }
          }
        });
      });

      function connectToPeer(_x5) {
        return _connectToPeer.apply(this, arguments);
      }

      return connectToPeer;
    }()
  }, {
    key: "emitToPeer",
    value: function () {
      var _emitToPeer = _asyncToGenerator(function* (clientId, type) {
        var peer = yield this.getConnectedPeer(clientId);

        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }

        var message = (0, _msgpackr.pack)(new _messagepack.PeerEvent(type, args));

        if (message.length > 65536) {
          var chunks = _messagepack.MultipartContainer.chunk(message, 65536);

          var _iterator15 = _createForOfIteratorHelper(chunks),
              _step15;

          try {
            for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
              var chunk = _step15.value;
              var ok = peer.write(chunk);

              if (!ok) {
                yield new Promise(function (resolve) {
                  peer.once('drain', function () {
                    resolve();
                  });
                });
              }
            }
          } catch (err) {
            _iterator15.e(err);
          } finally {
            _iterator15.f();
          }
        } else {
          var _ok = peer.write(message);

          if (!_ok) {
            yield new Promise(function (resolve) {
              peer.once('drain', function () {
                resolve();
              });
            });
          }
        }
      });

      function emitToPeer(_x8, _x9) {
        return _emitToPeer.apply(this, arguments);
      }

      return emitToPeer;
    }()
  }, {
    key: "addStream",
    value: function () {
      var _addStream = _asyncToGenerator(function* (clientId, stream) {
        var peer = yield this.getConnectedPeer(clientId);

        var addTrackHandler = function addTrackHandler(event) {
          if (event instanceof MediaStreamTrackEvent) {
            peer.addTrack(event.track);
          }
        };

        this.peerAddTrackHandlerMap.set(stream, addTrackHandler);
        stream.addEventListener('addtrack', addTrackHandler);
        peer.addStream(stream);
      });

      function addStream(_x10, _x11) {
        return _addStream.apply(this, arguments);
      }

      return addStream;
    }()
  }, {
    key: "removeStream",
    value: function () {
      var _removeStream = _asyncToGenerator(function* (clientId, stream) {
        var peer = yield this.getConnectedPeer(clientId);
        var addTrackHandler = this.peerAddTrackHandlerMap.get(stream);

        if (typeof addTrackHandler === 'function') {
          stream.removeEventListener('addtrack', addTrackHandler);
        }

        peer.removeStream(stream);
      });

      function removeStream(_x12, _x13) {
        return _removeStream.apply(this, arguments);
      }

      return removeStream;
    }()
  }, {
    key: "disconnectFromPeer",
    value: function () {
      var _disconnectFromPeer = _asyncToGenerator(function* (clientId) {
        var peer = this.peerMap.get(clientId);

        if (typeof peer === 'undefined') {
          return;
        }

        this.peerMap.delete(clientId);

        if (peer.connected) {
          peer.send((0, _msgpackr.pack)(new _messagepack.Close(1000, 'Disconnect requested')));
        }

        peer.destroy();
      });

      function disconnectFromPeer(_x14) {
        return _disconnectFromPeer.apply(this, arguments);
      }

      return disconnectFromPeer;
    }()
  }, {
    key: "onIdle",
    value: function () {
      var _onIdle = _asyncToGenerator(function* () {
        while (this.queueMap.size > 0) {
          var _iterator16 = _createForOfIteratorHelper(this.queueMap.values()),
              _step16;

          try {
            for (_iterator16.s(); !(_step16 = _iterator16.n()).done;) {
              var queue = _step16.value;
              yield queue.onIdle();
            } // $FlowFixMe

          } catch (err) {
            _iterator16.e(err);
          } finally {
            _iterator16.f();
          }

          yield new Promise(function (resolve) {
            return queueMicrotask(resolve);
          });
        }
      });

      function onIdle() {
        return _onIdle.apply(this, arguments);
      }

      return onIdle;
    }()
  }, {
    key: "didStartSession",
    value: function didStartSession() {
      if (!this.sessionId) {
        return false;
      }

      return this.startedSessionId === this.sessionId;
    }
  }, {
    key: "removeFromSession",
    value: function () {
      var _removeFromSession = _asyncToGenerator(function* (clientId) {
        var sessionId = this.sessionId;

        if (sessionId === false) {
          this.logger.warn("Unable to remove client ".concat(clientId, " from session, not in a session"));
          return;
        }

        var sessionClientMap = this.sessionClientMap;
        var socket = sessionClientMap.get(clientId);

        if (typeof socket === 'undefined') {
          this.logger.warn("Unable to remove client ".concat(clientId, ", client not in session ").concat(sessionId));
          return;
        }

        var userId = socket.userId,
            socketId = socket.socketId,
            serverId = socket.serverId;

        if (this.userId !== userId) {
          this.preApprovedSessionUserIdSet.delete(userId);
        }

        yield this.publish(_constants.REMOVE_FROM_SESSION, {
          userId: userId,
          socketId: socketId,
          serverId: serverId
        }, {
          CustomError: _errors.RemoveFromSessionError
        });
      });

      function removeFromSession(_x15) {
        return _removeFromSession.apply(this, arguments);
      }

      return removeFromSession;
    }()
  }, {
    key: "cancelInviteToSession",
    value: function () {
      var _cancelInviteToSession = _asyncToGenerator(function* (userId) {
        var queue = this.queueMap.get(_constants.SESSION_QUEUE);

        if (typeof queue !== 'undefined') {
          yield queue.onIdle();
        }

        var sessionId = this.sessionId; // eslint-disable-line no-undef

        if (typeof sessionId === 'string') {
          this.preApprovedSessionUserIdSet.delete(userId);
          this.emit('cancelInvite', {
            sessionId: sessionId,
            userId: userId
          });
          yield this.publish(_constants.CANCEL_INVITE_TO_SESSION, {
            sessionId: sessionId,
            userId: userId
          }, {
            CustomError: _errors.CancelInviteToSessionError
          });
        } else {
          this.logger.warn("Unable to cancel invite to user ".concat(userId, ", not in session"));
        }
      });

      function cancelInviteToSession(_x16) {
        return _cancelInviteToSession.apply(this, arguments);
      }

      return cancelInviteToSession;
    }()
  }, {
    key: "inviteToSession",
    value: function () {
      var _inviteToSession = _asyncToGenerator(function* (userId) {
        var _this7 = this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var data = options.data,
            _options$timeoutDurat = options.timeoutDuration,
            timeoutDuration = _options$timeoutDurat === void 0 ? 30000 : _options$timeoutDurat,
            sessionJoinHandler = options.sessionJoinHandler;
        var queue = this.queueMap.get(_constants.SESSION_QUEUE);

        if (typeof queue !== 'undefined') {
          yield queue.onIdle();
        }

        var hasSessionId = this.sessionId === 'string'; // $FlowFixMe

        var sessionId = this.sessionId || globalThis.crypto.randomUUID(); // eslint-disable-line no-undef

        var didCancel = false;

        var handleCancelInviteBeforePublish = function handleCancelInviteBeforePublish(_ref9) {
          var cancelledSessionId = _ref9.sessionId,
              cancelledUserId = _ref9.userId;

          if (cancelledSessionId !== sessionId) {
            return;
          }

          if (cancelledUserId !== userId) {
            return;
          }

          didCancel = true;
        };

        var leaveSession = /*#__PURE__*/function () {
          var _ref10 = _asyncToGenerator(function* () {
            if (hasSessionId) {
              return;
            }

            try {
              yield _this7.leaveSession();
            } catch (error) {
              _this7.logger.error('Unable to leave session');

              _this7.logger.errorStack(error);
            }
          });

          return function leaveSession() {
            return _ref10.apply(this, arguments);
          };
        }();

        this.addListener('cancelInvite', handleCancelInviteBeforePublish);

        try {
          if (hasSessionId) {
            this.preApprovedSessionUserIdSet.add(userId);
            yield this.publish(_constants.INVITE_TO_SESSION, {
              userId: userId,
              sessionId: sessionId,
              data: data
            }, {
              CustomError: _errors.InviteToSessionError
            });
          } else {
            yield this.startSession(sessionId, sessionJoinHandler);
            this.preApprovedSessionUserIdSet.add(userId);
            yield this.publish(_constants.INVITE_TO_SESSION, {
              userId: userId,
              sessionId: sessionId,
              data: data
            }, {
              CustomError: _errors.InviteToSessionError
            });
          }
        } catch (error) {
          throw error;
        } finally {
          this.removeListener('cancelInvite', handleCancelInviteBeforePublish);
        }

        if (didCancel) {
          yield leaveSession();
          throw new _errors.InvitationCancelledError("Invitation to user ".concat(userId, " was cancelled"));
        }

        yield new Promise(function (resolve, reject) {
          var cleanup = function cleanup() {
            clearTimeout(timeout);

            _this7.removeListener('sessionJoin', handleSessionJoin);

            _this7.removeListener('close', handleClose);

            _this7.removeListener('leave', handleLeave);

            _this7.removeListener('session', handleSession);

            _this7.removeListener('socketLeave', handleSocketLeave);

            _this7.removeListener('cancelInvite', handleCancelInvite);

            _this7.inviteDeclineHandlerMap.delete("".concat(userId, ":").concat(sessionId));
          };

          var timeout = setTimeout( /*#__PURE__*/_asyncToGenerator(function* () {
            cleanup();
            yield leaveSession();
            reject(new _errors.InvitationTimeoutError("Invitation timed out after ".concat(Math.round(timeoutDuration / 100) / 10, " seconds")));
          }), timeoutDuration);

          var handleCancelInvite = /*#__PURE__*/function () {
            var _ref13 = _asyncToGenerator(function* (_ref12) {
              var cancelledSessionId = _ref12.sessionId,
                  cancelledUserId = _ref12.userId;

              if (cancelledSessionId !== sessionId) {
                return;
              }

              if (cancelledUserId !== userId) {
                return;
              }

              cleanup();
              yield leaveSession();
              reject(new _errors.InvitationCancelledError("Invitation to user ".concat(userId, " was cancelled")));
            });

            return function handleCancelInvite(_x18) {
              return _ref13.apply(this, arguments);
            };
          }();

          var handleSessionJoin = function handleSessionJoin(socket) {
            if (socket.sessionId !== sessionId) {
              return;
            }

            if (socket.userId !== userId) {
              return;
            }

            cleanup();
            resolve();
          }; // Only listen for socket leave events if the user is inviting themselves


          var handleSocketLeave = /*#__PURE__*/function () {
            var _ref14 = _asyncToGenerator(function* (socket) {
              if (socket.userId !== _this7.userId) {
                return;
              }

              var isOnlySocketForUserId = true;

              var _iterator17 = _createForOfIteratorHelper(_this7.socketMap.values()),
                  _step17;

              try {
                for (_iterator17.s(); !(_step17 = _iterator17.n()).done;) {
                  var socketData = _step17.value;

                  if (socketData.userId !== _this7.userId) {
                    continue;
                  }

                  if (socketData.clientId === _this7.clientId) {
                    continue;
                  }

                  isOnlySocketForUserId = false;
                }
              } catch (err) {
                _iterator17.e(err);
              } finally {
                _iterator17.f();
              }

              if (isOnlySocketForUserId) {
                cleanup();
                yield leaveSession();
                reject(new _errors.InvitedUserLeftError("User ".concat(userId, " left before accepting the invitation")));
              }
            });

            return function handleSocketLeave(_x19) {
              return _ref14.apply(this, arguments);
            };
          }();

          var handleSession = function handleSession(newSessionId) {
            if (newSessionId === sessionId) {
              return;
            }

            cleanup();
            resolve();
          };

          var handleClose = function handleClose() {
            cleanup();
            reject(new _errors.ClientClosedError('Closed before invite'));
          };

          var handleDecline = /*#__PURE__*/function () {
            var _ref15 = _asyncToGenerator(function* () {
              cleanup();
              yield leaveSession();
              reject(new _errors.InvitationDeclinedError('Invitation declined'));
            });

            return function handleDecline() {
              return _ref15.apply(this, arguments);
            };
          }();

          var handleLeave = /*#__PURE__*/function () {
            var _ref16 = _asyncToGenerator(function* (peerUserId) {
              if (userId !== peerUserId) {
                return;
              }

              cleanup();
              yield leaveSession();
              reject(new _errors.InvitedUserLeftError("User ".concat(userId, " left before accepting the invitation")));
            });

            return function handleLeave(_x20) {
              return _ref16.apply(this, arguments);
            };
          }();

          _this7.inviteDeclineHandlerMap.set("".concat(userId, ":").concat(sessionId || ''), handleDecline);

          _this7.addListener('sessionJoin', handleSessionJoin);

          _this7.addListener('close', handleClose);

          _this7.addListener('leave', handleLeave);

          _this7.addListener('session', handleSession);

          if (_this7.userId === userId) {
            _this7.addListener('socketLeave', handleSocketLeave);
          }

          _this7.addListener('cancelInvite', handleCancelInvite);
        });
      });

      function inviteToSession(_x17) {
        return _inviteToSession.apply(this, arguments);
      }

      return inviteToSession;
    }()
  }, {
    key: "startSession",
    value: function () {
      var _startSession = _asyncToGenerator(function* (sessionId, sessionJoinHandler) {
        var _this8 = this;

        this.preApprovedSessionUserIdSet.clear();
        var previousStartedSessionId = this.startedSessionId;
        this.startedSessionId = sessionId;

        try {
          yield this.addToQueue(_constants.SESSION_QUEUE, function () {
            return _this8.publish(_constants.START_SESSION, {
              sessionId: sessionId
            }, {
              CustomError: _errors.StartSessionError
            });
          });
        } catch (error) {
          this.startedSessionId = previousStartedSessionId;
          throw error;
        }

        delete this.joinedSessionId;

        if (typeof sessionJoinHandler === 'function') {
          var wrappedSessionJoinHandler = /*#__PURE__*/function () {
            var _ref17 = _asyncToGenerator(function* (values) {
              if (_this8.preApprovedSessionUserIdSet.has(values.userId)) {
                return [true, 200, 'Authorized'];
              }

              if (_this8.userId === values.userId) {
                return [true, 200, 'Authorized'];
              }

              if (typeof sessionJoinHandler === 'function') {
                return sessionJoinHandler(values);
              }

              return [true, 200, 'Authorized'];
            });

            return function wrappedSessionJoinHandler(_x23) {
              return _ref17.apply(this, arguments);
            };
          }();

          this.sessionJoinHandlerMap.set(sessionId, wrappedSessionJoinHandler);
        } else {
          this.sessionJoinHandlerMap.set(sessionId, function () {
            return [true, 200, 'Authorized'];
          });
        }
      });

      function startSession(_x21, _x22) {
        return _startSession.apply(this, arguments);
      }

      return startSession;
    }()
  }, {
    key: "didJoinSession",
    value: function didJoinSession() {
      if (!this.sessionId) {
        return false;
      }

      return this.joinedSessionId === this.sessionId;
    }
  }, {
    key: "joinSession",
    value: function () {
      var _joinSession = _asyncToGenerator(function* (sessionId) {
        var _this9 = this;

        var timeoutDuration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 30000;
        var previousJoinedSessionId = this.joinedSessionId;
        this.joinedSessionId = sessionId;

        try {
          yield this.addToQueue(_constants.SESSION_QUEUE, function () {
            return _this9.publish(_constants.JOIN_SESSION, {
              sessionId: sessionId,
              timeoutDuration: timeoutDuration
            }, {
              CustomError: _errors.JoinSessionError,
              timeoutDuration: timeoutDuration + 5000
            });
          });
        } catch (error) {
          this.joinedSessionId = previousJoinedSessionId;
          throw error;
        }

        var startedSessionId = this.startedSessionId;
        delete this.startedSessionId;

        if (typeof startedSessionId === 'string') {
          this.sessionJoinHandlerMap.delete(startedSessionId);
        }
      });

      function joinSession(_x24) {
        return _joinSession.apply(this, arguments);
      }

      return joinSession;
    }()
  }, {
    key: "abortJoinSession",
    value: function () {
      var _abortJoinSession = _asyncToGenerator(function* () {
        yield this.publish(_constants.ABORT_SESSION_JOIN_REQUEST, {}, {
          CustomError: _errors.AbortSessionJoinError
        });
      });

      function abortJoinSession() {
        return _abortJoinSession.apply(this, arguments);
      }

      return abortJoinSession;
    }()
  }, {
    key: "leaveSession",
    value: function () {
      var _leaveSession = _asyncToGenerator(function* () {
        var _this10 = this;

        try {
          yield this.addToQueue(_constants.SESSION_QUEUE, function () {
            return _this10.publish(_constants.LEAVE_SESSION, {}, {
              CustomError: _errors.LeaveSessionError
            });
          });
          var startedSessionId = this.startedSessionId;
          delete this.startedSessionId;
          delete this.joinedSessionId;

          if (typeof startedSessionId === 'string') {
            this.sessionJoinHandlerMap.delete(startedSessionId);
          }
        } catch (error) {
          if (error instanceof _errors.ClientClosedError) {
            return;
          }

          throw error;
        }
      });

      function leaveSession() {
        return _leaveSession.apply(this, arguments);
      }

      return leaveSession;
    }()
  }, {
    key: "handleMessage",
    value: function () {
      var _handleMessage = _asyncToGenerator(function* (message) {
        var _this11 = this;

        if (_typeof(message) !== 'object') {
          this.logger.error('Invalid message format');
          this.logger.error(JSON.stringify(message));
          return;
        }

        var requestId = message.requestId,
            type = message.type,
            value = message.value;

        if (typeof type !== 'string') {
          this.logger.error('Invalid message format, type property should be of type "string"');
          this.logger.error(JSON.stringify(message));
          return;
        }

        if (_typeof(value) !== 'object') {
          this.logger.error('Invalid message format, value property should be of type "object"');
          this.logger.error(JSON.stringify(message));
          return;
        }

        if (type === _constants.RESPONSE && typeof requestId === 'number') {
          var callback = this.requestCallbackMap.get(requestId);

          if (typeof callback !== 'function') {
            this.logger.error("Callback for request ".concat(requestId, " does not exist"));
            return;
          }

          var success = value.success,
              code = value.code,
              text = value.text;

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
          case _constants.SIGNAL:
            try {
              var clientId = value.clientId,
                  serverId = value.serverId,
                  socketId = value.socketId,
                  data = value.data;

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

              if (_typeof(data) !== 'object') {
                this.logger.error('Signal message contained an invalid data property');
                this.logger.error(JSON.stringify(message));
                return;
              }

              var peer = this.peerMap.get(clientId);

              if (typeof peer === 'undefined') {
                var signalQueue = this.signalQueueMap.get(clientId);

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

          case _constants.DECLINE_INVITE_TO_SESSION:
            try {
              var userId = value.userId,
                  sessionId = value.sessionId;

              if (typeof userId !== 'string') {
                this.logger.error('Decline invite request contained an invalid user ID');
                this.logger.error(JSON.stringify(message));
                return;
              }

              if (typeof sessionId !== 'string') {
                this.logger.error('Decline invite request contained an invalid session ID');
                this.logger.error(JSON.stringify(message));
                return;
              }

              var requestHash = "".concat(userId, ":").concat(sessionId);
              var inviteDeclineHandler = this.inviteDeclineHandlerMap.get(requestHash);

              if (typeof inviteDeclineHandler === 'function') {
                inviteDeclineHandler();
              }
            } catch (error) {
              this.logger.error('Unable to process decline invite request');
              this.logger.errorStack(error);
            }

            break;

          case _constants.ABORT_SESSION_JOIN_REQUEST:
            try {
              var _userId = value.userId,
                  _sessionId2 = value.sessionId;

              if (typeof _userId !== 'string') {
                this.logger.error('Abort session join request contained an invalid user ID');
                this.logger.error(JSON.stringify(message));
                return;
              }

              if (typeof _sessionId2 !== 'string') {
                this.logger.error('Abort session join request contained an invalid session ID');
                this.logger.error(JSON.stringify(message));
                return;
              }

              var _requestHash = "".concat(_userId, ":").concat(_sessionId2);

              var existing = this.sessionJoinRequestMap.get(_requestHash);

              if (!Array.isArray(existing)) {
                this.logger.warn("Unable to abort session join request for user ".concat(_userId, " and session ").concat(_sessionId2, ", request does not exist"));
                return;
              }

              this.logger.warn("Aborting session join request for user ".concat(_userId, " and session ").concat(_sessionId2));
              existing[1].abort();
            } catch (error) {
              this.logger.error('Unable to process session abort join request');
              this.logger.errorStack(error);
            }

            break;

          case _constants.SESSION_JOIN_REQUEST:
            try {
              var _userId2 = value.userId,
                  _sessionId3 = value.sessionId;

              if (typeof _userId2 !== 'string') {
                this.logger.error('Session join request contained an invalid user ID');
                this.logger.error(JSON.stringify(message));
                return;
              }

              if (typeof _sessionId3 !== 'string') {
                this.logger.error('Session join request contained an invalid session ID');
                this.logger.error(JSON.stringify(message));
                return;
              }

              var _requestHash2 = "".concat(_userId2, ":").concat(_sessionId3);

              var _existing = this.sessionJoinRequestMap.get(_requestHash2);

              if (Array.isArray(_existing)) {
                this.logger.warn("Session join request for user ".concat(_userId2, " and session ").concat(_sessionId3, " already exists"));
                yield _existing[0];
                return;
              }

              var sessionJoinHandler = this.sessionJoinHandlerMap.get(_sessionId3);

              if (typeof sessionJoinHandler !== 'function') {
                this.logger.error("Handler for session ".concat(_sessionId3, " does not exist"));
                return;
              }

              var abortController = new AbortController();
              abortController.signal.addEventListener('abort', function () {
                _this11.sessionJoinRequestMap.delete(_requestHash2);
              });

              var promise = _asyncToGenerator(function* () {
                var response = [false, 500, 'Error in sesssion join handler'];

                try {
                  response = yield sessionJoinHandler({
                    userId: _userId2,
                    sessionId: _sessionId3,
                    abortSignal: abortController.signal
                  });
                } catch (error) {
                  _this11.logger.error("Unable to respond to session join request for user ".concat(_userId2, " and session ").concat(_sessionId3, ", error in session join handler"));

                  _this11.logger.errorStack(error);
                }

                if (abortController.signal.aborted) {
                  _this11.logger.warn("Session join request for user ".concat(_userId2, " and session ").concat(_sessionId3, " was aborted"));

                  return;
                }

                try {
                  yield _this11.publish(_constants.SESSION_JOIN_RESPONSE, {
                    userId: _userId2,
                    sessionId: _sessionId3,
                    success: response[0],
                    code: response[1],
                    text: response[2]
                  }, {
                    CustomError: _errors.SessionJoinResponseError
                  });
                } catch (error) {
                  _this11.logger.error("Unable to send session join response for user ".concat(_userId2, " and session ").concat(_sessionId3));

                  _this11.logger.errorStack(error);
                }

                _this11.sessionJoinRequestMap.delete(_requestHash2);
              })();

              this.sessionJoinRequestMap.set(_requestHash2, [promise, abortController]);
              yield promise;
            } catch (error) {
              this.logger.error('Unable to process session join request');
              this.logger.errorStack(error);
            }

            break;

          default:
            this.logger.warn("Unknown message type ".concat(type));
        }
      });

      function handleMessage(_x25) {
        return _handleMessage.apply(this, arguments);
      }

      return handleMessage;
    }()
  }, {
    key: "getConnectedPeer",
    value: function () {
      var _getConnectedPeer = _asyncToGenerator(function* (clientId) {
        var _this12 = this;

        var peer = this.peerMap.get(clientId);

        if (typeof peer !== 'undefined' && peer.connected) {
          return peer;
        }

        return new Promise(function (resolve, reject) {
          var _peer; // eslint-disable-line no-underscore-dangle


          var cleanup = function cleanup() {
            _this12.removeListener('sessionClientLeave', handleSessionClientLeave);

            _this12.removeListener('connect', handleConnect);

            _this12.removeListener('peer', handlePeer);

            if (typeof _peer !== 'undefined') {
              _peer.removeListener('close', handlePeerClose);

              _peer.removeListener('error', handlePeerError);
            }
          };

          var handlePeerClose = function handlePeerClose() {
            cleanup();
            reject(new Error("Peer ".concat(clientId, " closed before connection was established")));
          };

          var handlePeerError = function handlePeerError(error) {
            cleanup();
            reject(error);
          };

          var handlePeer = function handlePeer(_ref19) {
            var newClientId = _ref19.clientId,
                _p = _ref19.peer;

            if (newClientId !== clientId) {
              return;
            }

            _peer = _p;

            _p.addListener('close', handlePeerClose);

            _p.addListener('error', handlePeerError);
          };

          var handleConnect = function handleConnect(_ref20) {
            var newClientId = _ref20.clientId,
                _p = _ref20.peer;

            if (newClientId !== clientId) {
              return;
            }

            cleanup();
            resolve(_p);
          };

          var handleSessionClientLeave = function handleSessionClientLeave(oldClientId) {
            if (clientId !== oldClientId) {
              return;
            }

            cleanup();
            reject(new Error("Client ".concat(clientId, " left before connection was established")));
          };

          _this12.addListener('sessionClientLeave', handleSessionClientLeave);

          _this12.addListener('connect', handleConnect);

          _this12.addListener('peer', handlePeer);
        });
      });

      function getConnectedPeer(_x26) {
        return _getConnectedPeer.apply(this, arguments);
      }

      return getConnectedPeer;
    }()
  }, {
    key: "declineInviteToSession",
    value: function declineInviteToSession(data) {
      return this.publish(_constants.DECLINE_INVITE_TO_SESSION, data, {
        CustomError: _errors.DeclineInviteToSessionError
      });
    }
  }, {
    key: "reset",
    value: function reset() {
      this.handleBraidSet(this.name, []);
      clearTimeout(this.leaveSessionAfterLastClientTimeout);
    }
  }, {
    key: "close",
    value: function () {
      var _close = _asyncToGenerator(function* () {
        var _this13 = this;

        this.logger.info('Closing');
        this.active = false;
        this.reset();

        var _iterator18 = _createForOfIteratorHelper(this.peerDisconnectTimeoutMap),
            _step18;

        try {
          var _loop = function _loop() {
            var _step18$value = _slicedToArray(_step18.value, 2),
                clientId = _step18$value[0],
                timeout = _step18$value[1];

            clearTimeout(timeout);

            _this13.addToQueue(clientId, function () {
              return _this13.disconnectFromPeer(clientId);
            });
          };

          for (_iterator18.s(); !(_step18 = _iterator18.n()).done;) {
            _loop();
          }
        } catch (err) {
          _iterator18.e(err);
        } finally {
          _iterator18.f();
        }

        this.peerDisconnectTimeoutMap.clear();
        this.emit('close');

        try {
          yield this.onIdle();
        } catch (error) {
          this.logger.error('Error in queue during close');
          this.logger.errorStack(error);
        }

        this.removeListener('socketJoin', this.handleSocketJoin);
        this.removeListener('socketLeave', this.handleSocketLeave);
        this.removeListener('sessionClientJoin', this.handleSessionClientJoin);
        this.removeListener('sessionClientLeave', this.handleSessionClientLeave);
        this.removeListener('session', this.handleSession);
        this.braidClient.data.removeListener('set', this.handleBraidSet);
        this.braidClient.removeListener('close', this.handleBraidClose);
        this.braidClient.removeListener('closeRequested', this.handleBraidCloseRequested);
        this.braidClient.removeListener('reconnect', this.handleBraidReconnect);
        this.braidClient.stopPublishing(this.publishName);
        this.braidClient.removeServerEventListener(this.name);
        this.braidClient.unsubscribe(this.name);
      });

      function close() {
        return _close.apply(this, arguments);
      }

      return close;
    }()
  }]);

  return Bond;
}(_events.default);

exports.Bond = Bond;

_defineProperty(Bond, "declineInviteToSession", void 0);

_defineProperty(Bond, "getLocalRoomId", void 0);

var publish = function publish(braidClient, abortSignal, roomId, type, value) {
  var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
  var name = "signal/".concat(roomId);
  var publishName = "signal/".concat(roomId, "/").concat(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36));
  var timeoutDuration = typeof options.timeoutDuration === 'number' ? options.timeoutDuration : 5000;
  var CustomError = typeof options.CustomError === 'function' ? options.CustomError : _errors.RequestError;
  var requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  return new Promise(function (resolve, reject) {
    var cleanup = function cleanup() {
      clearTimeout(timeout);
      abortSignal.removeEventListener('abort', handleAbort);
      braidClient.removeServerEventListener(name);
      braidClient.stopPublishing(publishName);
    };

    var handleAbort = function handleAbort() {
      cleanup();
      reject(new _errors.AbortError("Publish request aborted before ".concat(type, " request completed")));
    };

    var timeout = setTimeout(function () {
      cleanup();
      reject(new _errors.RequestTimeoutError("".concat(type, " requested timed out after ").concat(timeoutDuration, "ms")));
    }, timeoutDuration);

    var handleMessage = function handleMessage(message) {
      if (_typeof(message) !== 'object') {
        return;
      }

      var responseId = message.requestId,
          responseType = message.type,
          responseValue = message.value;

      if (responseType !== _constants.RESPONSE) {
        return;
      }

      if (responseId !== requestId) {
        return;
      }

      var success = responseValue.success,
          code = responseValue.code,
          text = responseValue.text;
      cleanup();

      if (success) {
        resolve({
          code: code,
          text: text
        });
        return;
      }

      reject(new CustomError(text, code));
    };

    abortSignal.addEventListener('abort', handleAbort);
    Promise.all([braidClient.startPublishing(publishName), braidClient.addServerEventListener(name, handleMessage)]).then(function () {
      braidClient.publish(publishName, {
        requestId: requestId,
        type: type,
        value: value
      });
    }).catch(function (error) {
      cleanup();
      reject(error);
    });
  });
};

Bond.declineInviteToSession = function (braidClient, abortSignal, data) {
  var roomId = data.roomId;
  return publish(braidClient, abortSignal, roomId, _constants.DECLINE_INVITE_TO_SESSION, data, {
    CustomError: _errors.DeclineInviteToSessionError
  });
};

Bond.getLocalRoomId = /*#__PURE__*/function () {
  var _ref21 = _asyncToGenerator(function* (braidClient, _roomId, userId, abortSignal) {
    var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    var bond = new Bond(braidClient, _constants.AUTOMATIC_DISCOVERY_ROOM_ID, userId, Object.assign({}, options, {
      localConnectionsOnly: true
    }));
    var roomId = _roomId; // eslint-disable-line no-undef

    var localKey = bond.clientId.toString(36);
    var logger = options.logger || braidClient.logger;
    var negotiatedRoomId = yield new Promise(function (resolve, reject) {
      var handleSession = function handleSession() {
        bond.data.set(localKey, roomId);
      };

      var handleConnect = function handleConnect(_ref22) {
        var clientId = _ref22.clientId,
            socketHash = _ref22.socketHash;
        var socket = bond.socketMap.get(socketHash);

        if (typeof socket === 'undefined') {
          return;
        }

        var sessionId = socket.sessionId;

        if (typeof sessionId !== 'string') {
          return;
        }

        if (clientId > bond.clientId) {
          bond.joinSession(sessionId).catch(function (error) {
            logger.error('Unable to join session during automatic linking');
            logger.errorStack(error);
          });
        }
      };

      var handleSessionJoin = function handleSessionJoin(_ref23) {
        var clientId = _ref23.clientId,
            sessionId = _ref23.sessionId;

        if (typeof sessionId === 'string' && bond.sessionId === sessionId) {
          return;
        }

        if (!bond.peerMap.has(clientId)) {
          return;
        }

        if (typeof sessionId !== 'string') {
          return;
        }

        if (clientId > bond.clientId) {
          bond.joinSession(sessionId).catch(function (error) {
            logger.error('Unable to join session during automatic linking');
            logger.errorStack(error);
          });
        }
      };

      var handleSet = function handleSet(key, remoteRoomId) {
        if (key === localKey) {
          return;
        }

        var clientId = parseInt(key, 36);

        if (!bond.peerMap.has(clientId)) {
          return;
        }

        if (roomId === false && remoteRoomId === false && clientId < bond.clientId) {
          roomId = globalThis.crypto.randomUUID(); // eslint-disable-line no-undef

          bond.data.set(localKey, roomId);
          return;
        } else if (typeof roomId === 'string' && typeof remoteRoomId === 'string' && roomId !== remoteRoomId && clientId > bond.clientId) {
          roomId = remoteRoomId;
          bond.data.set(localKey, remoteRoomId);
        } else if (roomId === false && typeof remoteRoomId === 'string') {
          roomId = remoteRoomId;
          bond.data.set(localKey, remoteRoomId);
        } else if (typeof roomId !== 'string' || roomId !== remoteRoomId) {
          return;
        }

        abortSignal.removeEventListener('abort', handleAbort);
        bond.removeListener('close', handleClose);
        bond.removeListener('connect', handleConnect);
        bond.removeListener('sessionJoin', handleSessionJoin);
        bond.removeListener('session', handleSession);
        bond.data.removeListener('set', handleSet);
        resolve(roomId);
      };

      var handleClose = function handleClose() {
        abortSignal.removeEventListener('abort', handleAbort);
        bond.removeListener('close', handleClose);
        bond.removeListener('connect', handleConnect);
        bond.removeListener('sessionJoin', handleSessionJoin);
        bond.removeListener('session', handleSession);
        bond.data.removeListener('set', handleSet);
        reject(new _errors.ClientClosedError('Client closed before local room ID was discovered'));
      };

      var handleAbort = /*#__PURE__*/function () {
        var _ref24 = _asyncToGenerator(function* () {
          abortSignal.removeEventListener('abort', handleAbort);
          bond.removeListener('close', handleClose);
          bond.removeListener('connect', handleConnect);
          bond.removeListener('sessionJoin', handleSessionJoin);
          bond.removeListener('session', handleSession);
          bond.data.removeListener('set', handleSet);

          try {
            var queue = bond.queueMap.get(_constants.SESSION_QUEUE);

            if (typeof queue !== 'undefined') {
              yield queue.onIdle();
            }

            yield bond.close();
          } catch (error) {
            logger.error('Unable to close before throwing abort error');
            logger.errorStack(error);
          }

          reject(new _errors.AbortError('Local room ID discovery aborted'));
        });

        return function handleAbort() {
          return _ref24.apply(this, arguments);
        };
      }();

      abortSignal.addEventListener('abort', handleAbort);
      bond.data.addListener('set', handleSet);
      bond.addListener('close', handleClose);
      bond.addListener('connect', handleConnect);
      bond.addListener('sessionJoin', handleSessionJoin);
      bond.addListener('session', handleSession);
      bond.startSession(globalThis.crypto.randomUUID()); // eslint-disable-line no-undef
    });
    yield bond.close();
    return negotiatedRoomId;
  });

  return function (_x27, _x28, _x29, _x30) {
    return _ref21.apply(this, arguments);
  };
}();
//# sourceMappingURL=index.js.map