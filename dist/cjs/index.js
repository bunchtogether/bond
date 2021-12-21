"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bond = void 0;

var _events = _interopRequireDefault(require("events"));

var _map = _interopRequireDefault(require("observed-remove/dist/map"));

var _simplePeer = _interopRequireDefault(require("simple-peer"));

var _pQueue = _interopRequireDefault(require("p-queue"));

var _msgpackr = require("msgpackr");

var _constants = require("./constants");

var _errors = require("./errors");

var _messagepack = require("./messagepack");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } Object.defineProperty(subClass, "prototype", { value: Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }), writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

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
      clientId: x[3],
      sessionId: x[4]
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
      var clientId = socket.clientId,
          sessionId = socket.sessionId;

      if (sessionId === false) {
        continue;
      }

      var sessionClientMap = map.get(sessionId);

      if (typeof sessionClientMap === 'undefined') {
        map.set(sessionId, new Map([[clientId, socket]]));
      } else {
        sessionClientMap.set(clientId, socket);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return map;
}; // $FlowFixMe


var CustomObservedRemoveMap = /*#__PURE__*/function (_ObservedRemoveMap) {
  _inherits(CustomObservedRemoveMap, _ObservedRemoveMap);

  var _super = _createSuper(CustomObservedRemoveMap);

  function CustomObservedRemoveMap() {
    _classCallCheck(this, CustomObservedRemoveMap);

    return _super.apply(this, arguments);
  }

  _createClass(CustomObservedRemoveMap, [{
    key: "dequeue",
    value: // $FlowFixMe
    function dequeue() {
      var _this = this;

      if (this.publishTimeout) {
        return;
      }

      this.publishTimeout = true; // $FlowFixMe

      queueMicrotask(function () {
        return _this.publish();
      });
    }
  }]);

  return CustomObservedRemoveMap;
}(_map.default);

var Bond = /*#__PURE__*/function (_EventEmitter) {
  _inherits(Bond, _EventEmitter);

  var _super2 = _createSuper(Bond);

  function Bond(braidClient, roomId, userId) {
    var _this2;

    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    _classCallCheck(this, Bond);

    _this2 = _super2.call(this);
    _this2.active = true;
    _this2.clientId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    _this2.roomId = roomId;
    var name = "signal/".concat(_this2.roomId);
    _this2.name = name;
    _this2.publishName = "signal/".concat(_this2.roomId, "/").concat(_this2.clientId.toString(36));
    _this2.braidClient = braidClient;
    _this2.ready = _this2.init();
    _this2.logger = options.logger || braidClient.logger;
    _this2.peerOptions = options.peerOptions;
    _this2.socketMap = new Map();
    _this2.userIds = new Set();
    _this2.peerMap = new Map();
    _this2.queueMap = new Map();
    _this2.sessionMap = new Map();
    _this2.requestCallbackMap = new Map();
    _this2.signalQueueMap = new Map();
    _this2.peerDisconnectTimeoutMap = new Map();
    _this2.sessionJoinHandlerMap = new Map();
    _this2.sessionJoinRequestMap = new Map();
    _this2.data = new CustomObservedRemoveMap([], {
      bufferPublishing: 0
    });
    _this2.sessionClientOffsetMap = new Map();

    _this2.addListener('sessionClientJoin', _this2.handleSessionClientJoin.bind(_assertThisInitialized(_this2)));

    _this2.handleSet = function (key, values) {
      if (key !== name) {
        return;
      }

      _this2.active = true;
      var oldSocketMap = _this2.socketMap;
      var newSocketMap = getSocketMap(values);
      var oldUserIds = _this2.userIds;
      var newUserIds = getPeerIds(values);
      var oldSessionMap = _this2.sessionMap;
      var newSessionMap = getSessionMap(newSocketMap);
      var oldSessionClientIds = _this2.sessionClientIds;
      _this2.userIds = newUserIds;
      _this2.socketMap = newSocketMap;
      _this2.sessionMap = newSessionMap;
      var newSessionClientIds = _this2.sessionClientIds;

      var _iterator2 = _createForOfIteratorHelper(oldSocketMap),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
              socketHash = _step2$value[0],
              socketData = _step2$value[1];

          if (!newSocketMap.has(socketHash)) {
            _this2.emit('socketLeave', socketData);
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
            _this2.emit('socketJoin', _socketData);
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
          var peerUserId = _step4.value;

          if (!newUserIds.has(peerUserId)) {
            _this2.emit('leave', peerUserId);
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
          var _peerUserId = _step5.value;

          if (!oldUserIds.has(_peerUserId)) {
            _this2.emit('join', _peerUserId);
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }

      var _iterator6 = _createForOfIteratorHelper(oldSessionClientIds),
          _step6;

      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var clientId = _step6.value;

          if (clientId === _this2.clientId) {
            continue;
          }

          if (!newSessionClientIds.has(clientId)) {
            _this2.emit('sessionClientLeave', clientId);
          }
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }

      var _iterator7 = _createForOfIteratorHelper(newSessionClientIds),
          _step7;

      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var _clientId = _step7.value;

          if (_clientId === _this2.clientId) {
            continue;
          }

          if (!oldSessionClientIds.has(_clientId)) {
            _this2.emit('sessionClientJoin', _clientId);
          }
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }

      var _iterator8 = _createForOfIteratorHelper(oldSessionMap),
          _step8;

      try {
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          var _step8$value = _slicedToArray(_step8.value, 2),
              sessionId = _step8$value[0],
              oldSessionSocketMap = _step8$value[1];

          var newSessionSocketMap = newSessionMap.get(sessionId);

          if (typeof newSessionSocketMap === 'undefined') {
            var _iterator10 = _createForOfIteratorHelper(oldSessionSocketMap.values()),
                _step10;

            try {
              for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
                var _socketData2 = _step10.value;

                _this2.emit('sessionLeave', _socketData2);
              }
            } catch (err) {
              _iterator10.e(err);
            } finally {
              _iterator10.f();
            }
          } else {
            var _iterator11 = _createForOfIteratorHelper(oldSessionSocketMap),
                _step11;

            try {
              for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
                var _step11$value = _slicedToArray(_step11.value, 2),
                    _socketHash2 = _step11$value[0],
                    _socketData3 = _step11$value[1];

                if (!newSessionSocketMap.has(_socketHash2)) {
                  _this2.emit('sessionLeave', _socketData3);
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
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }

      var _iterator9 = _createForOfIteratorHelper(newSessionMap),
          _step9;

      try {
        for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
          var _step9$value = _slicedToArray(_step9.value, 2),
              _sessionId = _step9$value[0],
              _newSessionSocketMap = _step9$value[1];

          var _oldSessionSocketMap = oldSessionMap.get(_sessionId);

          if (typeof _oldSessionSocketMap === 'undefined') {
            var _iterator12 = _createForOfIteratorHelper(_newSessionSocketMap.values()),
                _step12;

            try {
              for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
                var _socketData4 = _step12.value;

                _this2.emit('sessionJoin', _socketData4);
              }
            } catch (err) {
              _iterator12.e(err);
            } finally {
              _iterator12.f();
            }
          } else {
            var _iterator13 = _createForOfIteratorHelper(_newSessionSocketMap),
                _step13;

            try {
              for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
                var _step13$value = _slicedToArray(_step13.value, 2),
                    _socketHash3 = _step13$value[0],
                    _socketData5 = _step13$value[1];

                if (!_oldSessionSocketMap.has(_socketHash3)) {
                  _this2.emit('sessionJoin', _socketData5);
                }
              }
            } catch (err) {
              _iterator13.e(err);
            } finally {
              _iterator13.f();
            }
          }
        }
      } catch (err) {
        _iterator9.e(err);
      } finally {
        _iterator9.f();
      }
    };

    _this2.braidClient.data.addListener('set', _this2.handleSet);

    _this2.addListener('socketJoin', function (socketData) {
      var clientId = socketData.clientId;

      if (clientId === _this2.clientId) {
        return;
      }

      if (_this2.peerDisconnectTimeoutMap.has(clientId)) {
        _this2.logger.info("Clearing client ".concat(clientId, " disconnect timeout after socket join"));

        clearTimeout(_this2.peerDisconnectTimeoutMap.get(clientId));

        _this2.peerDisconnectTimeoutMap.delete(clientId);
      }

      _this2.addToQueue(clientId, function () {
        return _this2.connectToPeer(socketData);
      });
    });

    _this2.addListener('socketLeave', function (socketData) {
      var clientId = socketData.clientId;

      if (clientId === _this2.clientId) {
        return;
      }

      clearTimeout(_this2.peerDisconnectTimeoutMap.get(clientId));

      if (_this2.active) {
        _this2.peerDisconnectTimeoutMap.set(clientId, setTimeout(function () {
          _this2.peerDisconnectTimeoutMap.delete(clientId);

          _this2.addToQueue(clientId, function () {
            return _this2.disconnectFromPeer(socketData);
          });
        }, 15000));
      } else {
        _this2.addToQueue(clientId, function () {
          return _this2.disconnectFromPeer(socketData);
        });
      }
    });

    _this2.braidClient.addListener('close', function () {
      var oldSocketData = _toConsumableArray(_this2.socketMap.values());

      var oldUserIds = _toConsumableArray(_this2.userIds);

      _this2.socketMap.clear();

      _this2.userIds.clear();

      var _iterator14 = _createForOfIteratorHelper(oldSocketData),
          _step14;

      try {
        for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
          var socketData = _step14.value;

          _this2.emit('socketLeave', socketData);
        }
      } catch (err) {
        _iterator14.e(err);
      } finally {
        _iterator14.f();
      }

      var _iterator15 = _createForOfIteratorHelper(oldUserIds),
          _step15;

      try {
        for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
          var oldUserId = _step15.value;

          _this2.emit('leave', oldUserId);
        }
      } catch (err) {
        _iterator15.e(err);
      } finally {
        _iterator15.f();
      }
    });

    _this2.braidClient.addListener('reconnect', function (isReconnecting) {
      if (!isReconnecting) {
        return;
      }

      var startedSessionId = _this2.startedSessionId;
      var joinedSessionId = _this2.joinedSessionId;

      var handleInitialized = function handleInitialized() {
        if (typeof startedSessionId === 'string') {
          _this2.logger.info("Restarting session ".concat(startedSessionId));

          _this2.startSession(startedSessionId).catch(function (error) {
            _this2.logger.error("Unable to restart session ".concat(startedSessionId, " after reconnect"));

            _this2.logger.errorStack(error);
          });
        }

        if (typeof joinedSessionId === 'string') {
          _this2.logger.info("Rejoining session ".concat(joinedSessionId));

          _this2.joinSession(joinedSessionId).catch(function (error) {
            _this2.logger.error("Unable to rejoin session ".concat(joinedSessionId, " after reconnect"));

            _this2.logger.errorStack(error);
          });
        }

        _this2.braidClient.removeListener('initialized', handleInitialized);

        _this2.braidClient.removeListener('close', handleClose);

        _this2.braidClient.removeListener('error', handleError);
      };

      var handleClose = function handleClose() {
        _this2.braidClient.removeListener('initialized', handleInitialized);

        _this2.braidClient.removeListener('close', handleClose);

        _this2.braidClient.removeListener('error', handleError);
      };

      var handleError = function handleError(error) {
        if (typeof startedSessionId === 'string') {
          _this2.logger.error("Unable to restart session ".concat(startedSessionId, " after reconnect"));

          _this2.logger.errorStack(error);
        }

        _this2.braidClient.removeListener('initialized', handleInitialized);

        _this2.braidClient.removeListener('close', handleClose);

        _this2.braidClient.removeListener('error', handleError);
      };

      _this2.braidClient.addListener('initialized', handleInitialized);

      _this2.braidClient.addListener('close', handleClose);

      _this2.braidClient.addListener('error', handleError);
    });

    return _this2;
  }

  _createClass(Bond, [{
    key: "sessionClientIds",
    get: function get() {
      var sessionId = this.sessionId;

      if (typeof sessionId !== 'string') {
        return new Set();
      }

      var sessionClientMap = this.sessionMap.get(sessionId);

      if (typeof sessionClientMap === 'undefined') {
        return new Set();
      }

      var clientIds = new Set(sessionClientMap.keys());
      clientIds.delete(this.clientId);
      return clientIds;
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
          yield promise;
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
        yield this.ready;
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

      function publish(_x, _x2) {
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
      var _connectToPeer = _asyncToGenerator(function* (_ref) {
        var _this6 = this;

        var userId = _ref.userId,
            serverId = _ref.serverId,
            socketId = _ref.socketId,
            clientId = _ref.clientId,
            socketHash = _ref.socketHash;
        var existingPeer = this.peerMap.get(clientId);
        var options = Object.assign({}, {
          initiator: clientId > this.clientId
        }, this.peerOptions);
        var peer = existingPeer || new _simplePeer.default(options);
        this.peerMap.set(clientId, peer);

        if (peer.connected) {
          peer.emit('peerReconnect');

          var handlePeerClose = function handlePeerClose() {
            _this6.logger.info("Peer ".concat(socketHash, " disconnected"));

            peer.removeListener('error', handlePeerError);
            peer.removeListener('close', handlePeerClose);
            peer.removeListener('peerReconnect', handlePeerReconnect);

            _this6.emit('disconnect', {
              userId: userId,
              serverId: serverId,
              socketId: socketId,
              peer: peer
            });
          };

          var handlePeerError = function handlePeerError(error) {
            _this6.logger.error("Peer ".concat(socketHash, " error"));

            _this6.logger.errorStack(error);

            _this6.emit('peerError', {
              error: error,
              userId: userId,
              serverId: serverId,
              socketId: socketId,
              peer: peer
            });
          };

          var handlePeerReconnect = function handlePeerReconnect() {
            _this6.logger.info("Peer ".concat(socketHash, " reconnected"));

            peer.removeListener('error', handlePeerError);
            peer.removeListener('close', handlePeerClose);
            peer.removeListener('peerReconnect', handlePeerReconnect);
          };

          peer.addListener('close', handlePeerClose);
          peer.addListener('error', handlePeerError);
          peer.addListener('peerReconnect', handlePeerReconnect);
          this.emit('connect', {
            userId: userId,
            clientId: clientId,
            serverId: serverId,
            socketId: socketId,
            peer: peer
          });
          return;
        }

        yield new Promise(function (resolve) {
          var timeout = setTimeout(function () {
            peer.removeListener('error', handleError);
            peer.removeListener('connect', handleConnect);
            peer.removeListener('signal', handleSignal);

            _this6.removeListener('close', handleClose);

            _this6.removeListener('socketLeave', handleSocketLeave);

            resolve();
          }, 5000);

          var handleConnect = function handleConnect() {
            clearTimeout(timeout);
            peer.removeListener('error', handleError);
            peer.removeListener('connect', handleConnect);
            peer.removeListener('signal', handleSignal);

            _this6.removeListener('close', handleClose);

            _this6.removeListener('socketLeave', handleSocketLeave);

            var handlePeerClose = function handlePeerClose() {
              _this6.logger.info("Peer ".concat(socketHash, " disconnected"));

              peer.removeListener('error', handlePeerError);
              peer.removeListener('close', handlePeerClose);
              peer.removeListener('peerReconnect', handlePeerReconnect);

              _this6.emit('disconnect', {
                userId: userId,
                serverId: serverId,
                socketId: socketId,
                peer: peer
              });
            };

            var handlePeerError = function handlePeerError(error) {
              _this6.logger.error("Peer ".concat(socketHash, " error"));

              _this6.logger.errorStack(error);

              _this6.emit('peerError', {
                error: error,
                userId: userId,
                serverId: serverId,
                socketId: socketId,
                peer: peer
              });
            };

            var handlePeerReconnect = function handlePeerReconnect() {
              _this6.logger.info("Peer ".concat(socketHash, " reconnected"));

              peer.removeListener('error', handlePeerError);
              peer.removeListener('close', handlePeerClose);
              peer.removeListener('peerReconnect', handlePeerReconnect);
            };

            peer.addListener('close', handlePeerClose);
            peer.addListener('error', handlePeerError);
            peer.addListener('peerReconnect', handlePeerReconnect);

            _this6.emit('connect', {
              userId: userId,
              clientId: clientId,
              serverId: serverId,
              socketId: socketId,
              peer: peer
            });

            resolve();
          };

          var handleSignal = /*#__PURE__*/function () {
            var _ref2 = _asyncToGenerator(function* (data) {
              try {
                yield _this6.publish(_constants.SIGNAL, {
                  serverId: serverId,
                  socketId: socketId,
                  data: data
                }, {
                  CustomError: _errors.SignalError
                });
              } catch (error) {
                _this6.logger.error("Unable to signal ".concat(socketHash));

                _this6.logger.errorStack(error);
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

            _this6.removeListener('close', handleClose);

            _this6.removeListener('socketLeave', handleSocketLeave);

            resolve();
          };

          var handleError = function handleError(error) {
            clearTimeout(timeout);
            peer.removeListener('error', handleError);
            peer.removeListener('connect', handleConnect);
            peer.removeListener('signal', handleSignal);

            _this6.removeListener('close', handleClose);

            _this6.removeListener('socketLeave', handleSocketLeave);

            _this6.logger.error("Error connecting to ".concat(userId));

            _this6.logger.errorStack(error);

            _this6.emit('error', error);

            resolve();
          };

          var handleSocketLeave = function handleSocketLeave(_ref3) {
            var oldSocketHash = _ref3.socketHash;

            if (socketHash !== oldSocketHash) {
              return;
            }

            clearTimeout(timeout);
            peer.removeListener('error', handleError);
            peer.removeListener('connect', handleConnect);
            peer.removeListener('signal', handleSignal);

            _this6.removeListener('close', handleClose);

            _this6.removeListener('socketLeave', handleSocketLeave);

            _this6.logger.warn("Unable to connect to ".concat(userId, ", socket closed before connection was completed"));

            resolve();
          };

          peer.addListener('error', handleError);
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

      function connectToPeer(_x3) {
        return _connectToPeer.apply(this, arguments);
      }

      return connectToPeer;
    }()
  }, {
    key: "disconnectFromPeer",
    value: function () {
      var _disconnectFromPeer = _asyncToGenerator(function* (_ref4) {
        var clientId = _ref4.clientId;
        var peer = this.peerMap.get(clientId);

        if (typeof peer === 'undefined') {
          return;
        }

        peer.destroy();
        this.peerMap.delete(clientId);
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
    key: "cleanupSession",
    value: function cleanupSession(newSessionId) {
      var startedSessionId = this.startedSessionId;
      delete this.startedSessionId;
      delete this.joinedSessionId;

      if (typeof startedSessionId === 'string') {
        this.sessionJoinHandlerMap.delete(startedSessionId);
      }

      var oldSessionId = this.sessionId;

      if (oldSessionId === newSessionId) {
        return;
      }

      var oldSessionClientIds = this.sessionClientIds;
      this.sessionId = newSessionId;
      var newSessionClientIds = this.sessionClientIds;

      var _iterator17 = _createForOfIteratorHelper(oldSessionClientIds),
          _step17;

      try {
        for (_iterator17.s(); !(_step17 = _iterator17.n()).done;) {
          var clientId = _step17.value;

          if (clientId === this.clientId) {
            continue;
          }

          if (!newSessionClientIds.has(clientId)) {
            this.emit('sessionClientLeave', clientId);
          }
        }
      } catch (err) {
        _iterator17.e(err);
      } finally {
        _iterator17.f();
      }

      var timelineValue = this.data.get(this.clientId);
      this.data.clear();
      this.sessionClientOffsetMap.clear();

      if (typeof timelineValue !== 'undefined') {
        this.data.set(this.clientId);
      }

      var _iterator18 = _createForOfIteratorHelper(newSessionClientIds),
          _step18;

      try {
        for (_iterator18.s(); !(_step18 = _iterator18.n()).done;) {
          var _clientId2 = _step18.value;

          if (_clientId2 === this.clientId) {
            continue;
          }

          if (!oldSessionClientIds.has(_clientId2)) {
            this.emit('sessionClientJoin', _clientId2);
          }
        }
      } catch (err) {
        _iterator18.e(err);
      } finally {
        _iterator18.f();
      }
    }
  }, {
    key: "startSession",
    value: function () {
      var _startSession = _asyncToGenerator(function* (sessionId, sessionJoinHandler) {
        var _this7 = this;

        yield this.addToQueue(_constants.SESSION_QUEUE, function () {
          return _this7.publish(_constants.START_SESSION, {
            sessionId: sessionId
          }, {
            CustomError: _errors.StartSessionError
          });
        });
        this.cleanupSession(sessionId);
        this.startedSessionId = sessionId;

        if (typeof sessionJoinHandler === 'function') {
          this.sessionJoinHandlerMap.set(sessionId, sessionJoinHandler);
        } else {
          this.sessionJoinHandlerMap.set(sessionId, function () {
            return [true, 200, 'Authorized'];
          });
        }
      });

      function startSession(_x6, _x7) {
        return _startSession.apply(this, arguments);
      }

      return startSession;
    }()
  }, {
    key: "joinSession",
    value: function () {
      var _joinSession = _asyncToGenerator(function* (sessionId) {
        var _this8 = this;

        var timeoutDuration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 30000;
        yield this.addToQueue(_constants.SESSION_QUEUE, function () {
          return _this8.publish(_constants.JOIN_SESSION, {
            sessionId: sessionId,
            timeoutDuration: timeoutDuration
          }, {
            CustomError: _errors.JoinSessionError
          });
        });
        this.cleanupSession(sessionId);
        this.joinedSessionId = sessionId;
      });

      function joinSession(_x8) {
        return _joinSession.apply(this, arguments);
      }

      return joinSession;
    }()
  }, {
    key: "leaveSession",
    value: function () {
      var _leaveSession = _asyncToGenerator(function* () {
        var _this9 = this;

        yield this.addToQueue(_constants.SESSION_QUEUE, function () {
          return _this9.publish(_constants.LEAVE_SESSION, {}, {
            CustomError: _errors.LeaveSessionError
          });
        });
        this.cleanupSession();
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
        var _this10 = this;

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

          case _constants.ABORT_SESSION_JOIN_REQUEST:
            try {
              var userId = value.userId,
                  sessionId = value.sessionId;

              if (typeof userId !== 'string') {
                this.logger.error('Abort session join request contained an invalid user ID');
                this.logger.error(JSON.stringify(message));
                return;
              }

              if (typeof sessionId !== 'string') {
                this.logger.error('Abort session join request contained an invalid session ID');
                this.logger.error(JSON.stringify(message));
                return;
              }

              var requestHash = "".concat(userId, ":").concat(sessionId);
              var existing = this.sessionJoinRequestMap.get(requestHash);

              if (!Array.isArray(existing)) {
                this.logger.warn("Unable to abort session join request for user ".concat(userId, " and session ").concat(sessionId, ", request does not exist"));
                return;
              }

              this.logger.warn("Aborting session join request for user ".concat(userId, " and session ").concat(sessionId));
              existing[1].abort();
            } catch (error) {
              this.logger.error('Unable to process session abort join request');
              this.logger.errorStack(error);
            }

            break;

          case _constants.SESSION_JOIN_REQUEST:
            try {
              var _userId = value.userId,
                  _sessionId2 = value.sessionId;

              if (typeof _userId !== 'string') {
                this.logger.error('Session join request contained an invalid user ID');
                this.logger.error(JSON.stringify(message));
                return;
              }

              if (typeof _sessionId2 !== 'string') {
                this.logger.error('Session join request contained an invalid session ID');
                this.logger.error(JSON.stringify(message));
                return;
              }

              var _requestHash = "".concat(_userId, ":").concat(_sessionId2);

              var _existing = this.sessionJoinRequestMap.get(_requestHash);

              if (Array.isArray(_existing)) {
                this.logger.warn("Session join request for user ".concat(_userId, " and session ").concat(_sessionId2, " already exists"));
                yield _existing[0];
                return;
              }

              var sessionJoinHandler = this.sessionJoinHandlerMap.get(_sessionId2);

              if (typeof sessionJoinHandler !== 'function') {
                this.logger.error("Handler for session ".concat(_sessionId2, " does not exist"));
                return;
              }

              var abortController = new AbortController();
              abortController.signal.addEventListener('abort', function () {
                _this10.sessionJoinRequestMap.delete(_requestHash);
              });

              var promise = _asyncToGenerator(function* () {
                var response = [false, 500, 'Error in sesssion join handler'];

                try {
                  response = yield sessionJoinHandler({
                    userId: _userId,
                    sessionId: _sessionId2,
                    abortSignal: abortController.signal
                  });
                } catch (error) {
                  _this10.logger.error("Unable to respond to session join request for user ".concat(_userId, " and session ").concat(_sessionId2, ", error in session join handler"));

                  _this10.logger.errorStack(error);
                }

                if (abortController.signal.aborted) {
                  _this10.logger.warn("Session join request for user ".concat(_userId, " and session ").concat(_sessionId2, " was aborted"));

                  return;
                }

                try {
                  yield _this10.publish(_constants.SESSION_JOIN_RESPONSE, {
                    userId: _userId,
                    sessionId: _sessionId2,
                    success: response[0],
                    code: response[1],
                    text: response[2]
                  }, {
                    CustomError: _errors.SessionJoinResponseError
                  });
                } catch (error) {
                  _this10.logger.error("Unable to send session join request for user ".concat(_userId, " and session ").concat(_sessionId2));

                  _this10.logger.errorStack(error);
                }

                _this10.sessionJoinRequestMap.delete(_requestHash);
              })();

              this.sessionJoinRequestMap.set(_requestHash, [promise, abortController]);
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

      function handleMessage(_x9) {
        return _handleMessage.apply(this, arguments);
      }

      return handleMessage;
    }()
  }, {
    key: "handleSessionClientJoin",
    value: function () {
      var _handleSessionClientJoin = _asyncToGenerator(function* (clientId) {
        var _this11 = this;

        var interval;
        var offset = 0;
        var abortController = new AbortController();
        var abortSignal = abortController.signal;

        var cleanup = function cleanup() {
          abortController.abort();

          _this11.removeListener('sessionClientLeave', handleSessionClientLeave);

          if (typeof peer !== 'undefined') {
            peer.removeListener('close', handlePeerClose);
            peer.removeListener('data', handlePeerData);
          }

          _this11.data.removeListener('publish', handleDataPublish);

          clearInterval(interval);
        };

        var handlePeerClose = function handlePeerClose() {
          cleanup();

          if (_this11.sessionClientIds.has(clientId)) {
            _this11.handleSessionClientJoin(clientId);
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

          peer.send((0, _msgpackr.pack)(unpacked));
        };

        var handlePeerData = function handlePeerData(packed) {
          var message = (0, _msgpackr.unpack)(packed);

          if (message instanceof _messagepack.Ping) {
            sendToPeer(new _messagepack.Pong(message.timestamp, Date.now()));
          } else if (message instanceof _messagepack.Pong) {
            offset = Date.now() - message.wallclock - (performance.now() - message.timestamp) / 2;

            _this11.sessionClientOffsetMap.set(clientId, offset);
          } else if (message instanceof _messagepack.ObservedRemoveDump) {
            _this11.data.process(message.queue);
          }
        };

        this.addListener('sessionClientLeave', handleSessionClientLeave);

        if (!this.isConnectedToClient(clientId)) {
          yield new Promise(function (resolve) {
            var handleConnect = function handleConnect(_ref6) {
              var newClientId = _ref6.clientId;

              if (newClientId !== clientId) {
                return;
              }

              _this11.removeListener('connect', handleConnect);

              abortSignal.removeEventListener('abort', handleAbort);
              resolve();
            };

            var handleAbort = function handleAbort() {
              _this11.removeListener('connect', handleConnect);

              abortSignal.removeEventListener('abort', handleAbort);
              resolve();
            };

            _this11.addListener('connect', handleConnect);

            abortSignal.addEventListener('abort', handleAbort);
          });

          if (abortSignal.aborted) {
            return;
          }
        }

        var peer = this.peerMap.get(clientId);

        if (typeof peer === 'undefined') {
          throw new Error('Peer does not exist');
        }

        peer.addListener('close', handlePeerClose);
        peer.addListener('data', handlePeerData);
        interval = setInterval(function () {
          peer.send((0, _msgpackr.pack)(new _messagepack.Ping(performance.now())));
        }, 1000);
        peer.send((0, _msgpackr.pack)(new _messagepack.Ping(performance.now())));
        this.data.addListener('publish', handleDataPublish);
        handleDataPublish(this.data.dump());
      });

      function handleSessionClientJoin(_x10) {
        return _handleSessionClientJoin.apply(this, arguments);
      }

      return handleSessionClientJoin;
    }()
  }, {
    key: "close",
    value: function close() {
      this.active = false;
      var oldSessionClientIds = this.sessionClientIds;

      var oldSocketData = _toConsumableArray(this.socketMap.values());

      var oldUserIds = _toConsumableArray(this.userIds);

      this.braidClient.data.removeListener('set', this.handleSet);
      this.braidClient.stopPublishing(this.publishName);
      this.braidClient.unsubscribe(this.name);
      this.braidClient.removeServerEventListener(this.name);
      this.socketMap.clear();
      this.userIds.clear();

      var _iterator19 = _createForOfIteratorHelper(this.peerDisconnectTimeoutMap.values()),
          _step19;

      try {
        for (_iterator19.s(); !(_step19 = _iterator19.n()).done;) {
          var timeout = _step19.value;
          clearTimeout(timeout);
        }
      } catch (err) {
        _iterator19.e(err);
      } finally {
        _iterator19.f();
      }

      var _iterator20 = _createForOfIteratorHelper(oldSessionClientIds),
          _step20;

      try {
        for (_iterator20.s(); !(_step20 = _iterator20.n()).done;) {
          var clientId = _step20.value;
          this.emit('sessionClientLeave', clientId);
        }
      } catch (err) {
        _iterator20.e(err);
      } finally {
        _iterator20.f();
      }

      var _iterator21 = _createForOfIteratorHelper(oldSocketData),
          _step21;

      try {
        for (_iterator21.s(); !(_step21 = _iterator21.n()).done;) {
          var socketData = _step21.value;
          this.emit('socketLeave', socketData);
        }
      } catch (err) {
        _iterator21.e(err);
      } finally {
        _iterator21.f();
      }

      var _iterator22 = _createForOfIteratorHelper(oldUserIds),
          _step22;

      try {
        for (_iterator22.s(); !(_step22 = _iterator22.n()).done;) {
          var userId = _step22.value;
          this.emit('leave', userId);
        }
      } catch (err) {
        _iterator22.e(err);
      } finally {
        _iterator22.f();
      }

      this.emit('close');
    }
  }]);

  return Bond;
}(_events.default);

exports.Bond = Bond;
//# sourceMappingURL=index.js.map