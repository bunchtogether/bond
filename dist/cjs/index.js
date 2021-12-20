"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bond = void 0;

var _events = _interopRequireDefault(require("events"));

var _simplePeer = _interopRequireDefault(require("simple-peer"));

var _pQueue = _interopRequireDefault(require("p-queue"));

var _constants = require("./constants");

var _errors = require("./errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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
      sessionId: x[3]
    }];
  }));
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

  var _iterator = _createForOfIteratorHelper(socketMap.values()),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var socket = _step.value;
      var socketHash = socket.socketHash,
          sessionId = socket.sessionId;
      var sessionSocketMap = map.get(sessionId);

      if (typeof sessionSocketMap === 'undefined') {
        map.set(sessionId, new Map([[socketHash, socket]]));
      } else {
        sessionSocketMap.set(socketHash, socket);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
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
    _this.roomId = roomId;
    _this.userId = userId;
    var name = "signal/".concat(_this.roomId);
    _this.name = name;
    _this.braidClient = braidClient;
    _this.ready = _this.init();
    _this.logger = options.logger || braidClient.logger;
    _this.wrtc = options.wrtc;
    _this.socketMap = new Map();
    _this.userIds = new Set();
    _this.peerMap = new Map();
    _this.queueMap = new Map();
    _this.sessionMap = new Map();
    _this.requestCallbackMap = new Map();
    _this.signalQueueMap = new Map();

    _this.handleSet = function (key, values) {
      if (key !== name) {
        return;
      }

      var oldSocketMap = _this.socketMap;
      var newSocketMap = getSocketMap(values);
      var oldUserIds = _this.userIds;
      var newUserIds = getPeerIds(values);
      var oldSessionMap = _this.sessionMap;
      var newSessionMap = getSessionMap(newSocketMap);
      _this.userIds = newUserIds;
      _this.socketMap = newSocketMap;
      _this.sessionMap = newSessionMap;

      var _iterator2 = _createForOfIteratorHelper(oldSocketMap),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
              socketHash = _step2$value[0],
              socketData = _step2$value[1];

          if (!newSocketMap.has(socketHash)) {
            _this.emit('socketLeave', socketData);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      var _iterator3 = _createForOfIteratorHelper(newSocketMap),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _step3$value = _slicedToArray(_step3.value, 2),
              _socketHash = _step3$value[0],
              _socketData = _step3$value[1];

          if (!oldSocketMap.has(_socketHash)) {
            _this.emit('socketJoin', _socketData);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      var _iterator4 = _createForOfIteratorHelper(oldUserIds),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var peerId = _step4.value;

          if (!newUserIds.has(peerId)) {
            _this.emit('leave', peerId);
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      var _iterator5 = _createForOfIteratorHelper(newUserIds),
          _step5;

      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var _peerId = _step5.value;

          if (!oldUserIds.has(_peerId)) {
            _this.emit('join', _peerId);
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }

      var _iterator6 = _createForOfIteratorHelper(oldSessionMap),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var _step6$value = _slicedToArray(_step6.value, 2),
              sessionId = _step6$value[0],
              oldSessionSocketMap = _step6$value[1];

          var newSessionSocketMap = newSessionMap.get(sessionId);

          if (typeof newSessionSocketMap === 'undefined') {
            var _iterator8 = _createForOfIteratorHelper(oldSessionSocketMap.values()),
                _step8;

            try {
              for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                var _socketData2 = _step8.value;

                _this.emit('sessionLeave', _socketData2);
              }
            } catch (err) {
              _iterator8.e(err);
            } finally {
              _iterator8.f();
            }
          } else {
            var _iterator9 = _createForOfIteratorHelper(oldSessionSocketMap),
                _step9;

            try {
              for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
                var _step9$value = _slicedToArray(_step9.value, 2),
                    _socketHash2 = _step9$value[0],
                    _socketData3 = _step9$value[1];

                if (!newSessionSocketMap.has(_socketHash2)) {
                  _this.emit('sessionLeave', _socketData3);
                }
              }
            } catch (err) {
              _iterator9.e(err);
            } finally {
              _iterator9.f();
            }
          }
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }

      var _iterator7 = _createForOfIteratorHelper(newSessionMap),
          _step7;

      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var _step7$value = _slicedToArray(_step7.value, 2),
              _sessionId = _step7$value[0],
              _newSessionSocketMap = _step7$value[1];

          var _oldSessionSocketMap = oldSessionMap.get(_sessionId);

          if (typeof _oldSessionSocketMap === 'undefined') {
            var _iterator10 = _createForOfIteratorHelper(_newSessionSocketMap.values()),
                _step10;

            try {
              for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
                var _socketData4 = _step10.value;

                _this.emit('sessionJoin', _socketData4);
              }
            } catch (err) {
              _iterator10.e(err);
            } finally {
              _iterator10.f();
            }
          } else {
            var _iterator11 = _createForOfIteratorHelper(_newSessionSocketMap),
                _step11;

            try {
              for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
                var _step11$value = _slicedToArray(_step11.value, 2),
                    _socketHash3 = _step11$value[0],
                    _socketData5 = _step11$value[1];

                if (!_oldSessionSocketMap.has(_socketHash3)) {
                  _this.emit('sessionJoin', _socketData5);
                }
              }
            } catch (err) {
              _iterator11.e(err);
            } finally {
              _iterator11.f();
            }
          }
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
    };

    _this.braidClient.data.addListener('set', _this.handleSet);

    _this.on('socketJoin', function (socketData) {
      _this.addToQueue(socketData.socketHash, function () {
        return _this.connectToPeer(socketData);
      });
    });

    _this.on('socketLeave', function (socketData) {
      _this.addToQueue(socketData.socketHash, function () {
        return _this.disconnectFromPeer(socketData);
      });
    });

    return _this;
  }

  _createClass(Bond, [{
    key: "init",
    value: function () {
      var _init = _asyncToGenerator(function* () {
        var _this2 = this;

        var promise = new Promise(function (resolve, reject) {
          var handleClose = function handleClose() {
            _this2.removeListener('close', handleClose);

            _this2.braidClient.data.removeListener('set', handleValue);

            _this2.braidClient.removeListener('error', handleError);

            reject(new Error('Closed before initialization completed'));
          };

          var handleValue = function handleValue(key, value) {
            if (key !== _this2.name) {
              return;
            }

            if (typeof value === 'undefined') {
              return;
            }

            _this2.removeListener('close', handleClose);

            _this2.braidClient.data.removeListener('set', handleValue);

            _this2.braidClient.removeListener('error', handleError);

            resolve();
          };

          var handleError = function handleError(error) {
            _this2.removeListener('close', handleClose);

            _this2.braidClient.data.removeListener('set', handleValue);

            _this2.braidClient.removeListener('error', handleError);

            reject(error);
          };

          _this2.addListener('close', handleClose);

          _this2.braidClient.data.addListener('set', handleValue);

          _this2.braidClient.addListener('error', handleError);

          handleValue(_this2.name, _this2.braidClient.data.get(_this2.name));
        });

        try {
          yield Promise.all([this.braidClient.subscribe(this.name), this.braidClient.addServerEventListener(this.name, this.handleMessage.bind(this))]);
          yield promise;
          yield this.braidClient.startPublishing(this.name);
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
      var _this3 = this;

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
        _this3.queueMap.delete(queueId);
      });
      return promise;
    }
  }, {
    key: "publish",
    value: function () {
      var _publish = _asyncToGenerator(function* (type, value) {
        var _this4 = this;

        var timeoutDuration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5000;
        yield this.ready;
        var requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        return new Promise(function (resolve, reject) {
          var timeout = setTimeout(function () {
            _this4.requestCallbackMap.delete(requestId);

            reject(new _errors.RequestTimeoutError("".concat(type, " requested timed out after ").concat(timeoutDuration, "ms")));
          }, timeoutDuration);

          var handleResponse = function handleResponse(success, code, text) {
            _this4.requestCallbackMap.delete(requestId);

            clearTimeout(timeout);

            if (success) {
              resolve({
                code: code,
                text: text
              });
              return;
            }

            reject(new _errors.RequestError(text, code));
          };

          _this4.requestCallbackMap.set(requestId, handleResponse);

          _this4.braidClient.publish(_this4.name, {
            requestId: requestId,
            type: type,
            value: value
          });
        });
      });

      function publish(_x, _x2) {
        return _publish.apply(this, arguments);
      }

      return publish;
    }()
  }, {
    key: "connectToPeer",
    value: function () {
      var _connectToPeer = _asyncToGenerator(function* (_ref) {
        var _this5 = this;

        var userId = _ref.userId,
            serverId = _ref.serverId,
            socketId = _ref.socketId,
            socketHash = _ref.socketHash;
        var peer = new _simplePeer.default({
          initiator: userId > this.userId,
          wrtc: this.wrtc
        });
        this.peerMap.set(socketHash, peer);
        yield new Promise(function (resolve) {
          var timeout = setTimeout(function () {
            peer.removeListener('error', handleError);
            peer.removeListener('connect', handleConnect);
            peer.removeListener('signal', handleSignal);

            _this5.removeListener('close', handleClose);

            resolve();
          }, 5000);

          var handleConnect = function handleConnect() {
            clearTimeout(timeout);
            peer.removeListener('error', handleError);
            peer.removeListener('connect', handleConnect);
            peer.removeListener('signal', handleSignal);

            _this5.removeListener('close', handleClose);

            var handlePeerClose = function handlePeerClose() {
              _this5.logger.info("Peer ".concat(socketHash, " disconnected"));

              peer.removeListener('error', handlePeerError);
              peer.removeListener('close', handlePeerClose);

              _this5.emit('disconnect', {
                userId: userId,
                serverId: serverId,
                socketId: socketId,
                peer: peer
              });
            };

            var handlePeerError = function handlePeerError(error) {
              _this5.logger.error("Peer ".concat(socketHash, " error"));

              _this5.logger.errorStack(error);

              _this5.emit('peerError', {
                error: error,
                userId: userId,
                serverId: serverId,
                socketId: socketId,
                peer: peer
              });
            };

            peer.addListener('close', handlePeerClose);
            peer.addListener('error', handlePeerError);

            _this5.emit('connect', {
              userId: userId,
              serverId: serverId,
              socketId: socketId,
              peer: peer
            });

            resolve();
          };

          var handleSignal = /*#__PURE__*/function () {
            var _ref2 = _asyncToGenerator(function* (data) {
              try {
                yield _this5.publish(_constants.SIGNAL, {
                  serverId: serverId,
                  socketId: socketId,
                  data: data
                });
              } catch (error) {
                _this5.logger.error("Unable to signal ".concat(socketHash));

                _this5.logger.errorStack(error);
              }
            });

            return function handleSignal(_x4) {
              return _ref2.apply(this, arguments);
            };
          }();

          var handleClose = function handleClose() {
            clearTimeout(timeout);
            peer.removeListener('error', handleError);
            peer.removeListener('connect', handleConnect);
            peer.removeListener('signal', handleSignal);

            _this5.removeListener('close', handleClose);

            resolve();
          };

          var handleError = function handleError(error) {
            clearTimeout(timeout);
            peer.removeListener('error', handleError);
            peer.removeListener('connect', handleConnect);
            peer.removeListener('signal', handleSignal);

            _this5.removeListener('close', handleClose);

            _this5.logger.error("Error connecting to ".concat(userId));

            _this5.logger.errorStack(error);

            _this5.emit('error', error);

            resolve();
          };

          peer.addListener('error', handleError);
          peer.addListener('connect', handleConnect);
          peer.addListener('signal', handleSignal);

          _this5.addListener('close', handleClose);

          var signalQueue = _this5.signalQueueMap.get(socketHash);

          if (Array.isArray(signalQueue)) {
            while (signalQueue.length > 0) {
              var data = signalQueue.shift();
              peer.signal(data);
            }
          }
        });
      });

      function connectToPeer(_x3) {
        return _connectToPeer.apply(this, arguments);
      }

      return connectToPeer;
    }()
  }, {
    key: "disconnectFromPeer",
    value: function () {
      var _disconnectFromPeer = _asyncToGenerator(function* (_ref3) {
        var socketHash = _ref3.socketHash;
        var peer = this.peerMap.get(socketHash);

        if (typeof peer === 'undefined') {
          return;
        }

        peer.destroy();
        this.peerMap.delete(socketHash);
      });

      function disconnectFromPeer(_x5) {
        return _disconnectFromPeer.apply(this, arguments);
      }

      return disconnectFromPeer;
    }()
  }, {
    key: "onIdle",
    value: function () {
      var _onIdle = _asyncToGenerator(function* () {
        while (this.queueMap.size > 0) {
          var _iterator12 = _createForOfIteratorHelper(this.queueMap.values()),
              _step12;

          try {
            for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
              var queue = _step12.value;
              yield queue.onIdle();
            } // $FlowFixMe

          } catch (err) {
            _iterator12.e(err);
          } finally {
            _iterator12.f();
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
    key: "startSession",
    value: function startSession(sessionId, password) {
      return this.publish(_constants.START_SESSION, {
        sessionId: sessionId,
        password: password
      });
    }
  }, {
    key: "leaveSession",
    value: function leaveSession() {
      return this.publish(_constants.LEAVE_SESSION, {});
    }
  }, {
    key: "handleMessage",
    value: function handleMessage(message) {
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
            var serverId = value.serverId,
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

            var socketHash = "".concat(socketId, ":").concat(serverId);
            var peer = this.peerMap.get(socketHash);

            if (typeof peer === 'undefined') {
              var signalQueue = this.signalQueueMap.get(socketHash);

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
          this.logger.warn("Unknown message type ".concat(type));
      }
    }
  }, {
    key: "close",
    value: function close() {
      var oldSocketMap = _toConsumableArray(this.socketMap.keys());

      var oldUserIds = _toConsumableArray(this.userIds);

      this.braidClient.data.removeListener('set', this.handleSet);
      this.braidClient.stopPublishing(this.name);
      this.braidClient.unsubscribe(this.name);
      this.braidClient.removeServerEventListener(this.name);
      this.socketMap.clear();
      this.userIds.clear();

      var _iterator13 = _createForOfIteratorHelper(oldSocketMap),
          _step13;

      try {
        for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
          var socketHash = _step13.value;
          this.emit('socketLeave', socketHash);
        }
      } catch (err) {
        _iterator13.e(err);
      } finally {
        _iterator13.f();
      }

      var _iterator14 = _createForOfIteratorHelper(oldUserIds),
          _step14;

      try {
        for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
          var userId = _step14.value;
          this.emit('leave', userId);
        }
      } catch (err) {
        _iterator14.e(err);
      } finally {
        _iterator14.f();
      }

      this.emit('close');
    }
  }]);

  return Bond;
}(_events.default);

exports.Bond = Bond;
//# sourceMappingURL=index.js.map