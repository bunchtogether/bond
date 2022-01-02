"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StartSessionError = exports.SignalError = exports.SessionJoinResponseError = exports.RequestTimeoutError = exports.RequestError = exports.RemoveFromSessionError = exports.LeaveSessionError = exports.JoinSessionError = exports.InvitedUserLeftError = exports.InviteToSessionError = exports.InvitationTimeoutError = exports.InvitationDeclinedError = exports.InvitationCancelledError = exports.DeclineInviteToSessionError = exports.ClientClosedError = exports.CancelInviteToSessionError = exports.AbortSessionJoinError = exports.AbortError = void 0;

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } Object.defineProperty(subClass, "prototype", { value: Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }), writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

// $FlowFixMe
var AbortError = /*#__PURE__*/function (_Error) {
  _inherits(AbortError, _Error);

  var _super = _createSuper(AbortError);

  function AbortError(message) {
    var _this;

    _classCallCheck(this, AbortError);

    _this = _super.call(this, message);
    _this.name = 'AbortError';
    return _this;
  }

  return _createClass(AbortError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.AbortError = AbortError;

var RequestTimeoutError = /*#__PURE__*/function (_Error2) {
  _inherits(RequestTimeoutError, _Error2);

  var _super2 = _createSuper(RequestTimeoutError);

  function RequestTimeoutError(message) {
    var _this2;

    _classCallCheck(this, RequestTimeoutError);

    _this2 = _super2.call(this, message);
    _this2.name = 'RequestTimeoutError';
    return _this2;
  }

  return _createClass(RequestTimeoutError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.RequestTimeoutError = RequestTimeoutError;

var ClientClosedError = /*#__PURE__*/function (_Error3) {
  _inherits(ClientClosedError, _Error3);

  var _super3 = _createSuper(ClientClosedError);

  function ClientClosedError(message) {
    var _this3;

    _classCallCheck(this, ClientClosedError);

    _this3 = _super3.call(this, message);
    _this3.name = 'ClientClosedError';
    return _this3;
  }

  return _createClass(ClientClosedError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.ClientClosedError = ClientClosedError;

var InvitationCancelledError = /*#__PURE__*/function (_Error4) {
  _inherits(InvitationCancelledError, _Error4);

  var _super4 = _createSuper(InvitationCancelledError);

  function InvitationCancelledError(message) {
    var _this4;

    _classCallCheck(this, InvitationCancelledError);

    _this4 = _super4.call(this, message);
    _this4.name = 'InvitationCancelledError';
    return _this4;
  }

  return _createClass(InvitationCancelledError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.InvitationCancelledError = InvitationCancelledError;

var InvitationDeclinedError = /*#__PURE__*/function (_Error5) {
  _inherits(InvitationDeclinedError, _Error5);

  var _super5 = _createSuper(InvitationDeclinedError);

  function InvitationDeclinedError(message) {
    var _this5;

    _classCallCheck(this, InvitationDeclinedError);

    _this5 = _super5.call(this, message);
    _this5.name = 'InvitationDeclinedError';
    return _this5;
  }

  return _createClass(InvitationDeclinedError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.InvitationDeclinedError = InvitationDeclinedError;

var InvitationTimeoutError = /*#__PURE__*/function (_Error6) {
  _inherits(InvitationTimeoutError, _Error6);

  var _super6 = _createSuper(InvitationTimeoutError);

  function InvitationTimeoutError(message) {
    var _this6;

    _classCallCheck(this, InvitationTimeoutError);

    _this6 = _super6.call(this, message);
    _this6.name = 'InvitationTimeoutError';
    return _this6;
  }

  return _createClass(InvitationTimeoutError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.InvitationTimeoutError = InvitationTimeoutError;

var InvitedUserLeftError = /*#__PURE__*/function (_Error7) {
  _inherits(InvitedUserLeftError, _Error7);

  var _super7 = _createSuper(InvitedUserLeftError);

  function InvitedUserLeftError(message) {
    var _this7;

    _classCallCheck(this, InvitedUserLeftError);

    _this7 = _super7.call(this, message);
    _this7.name = 'InvitedUserLeftError';
    return _this7;
  }

  return _createClass(InvitedUserLeftError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.InvitedUserLeftError = InvitedUserLeftError;

var RequestError = /*#__PURE__*/function (_Error8) {
  _inherits(RequestError, _Error8);

  var _super8 = _createSuper(RequestError);

  function RequestError(message, code) {
    var _this8;

    _classCallCheck(this, RequestError);

    _this8 = _super8.call(this, message);
    _this8.name = 'RequestError';
    _this8.code = code;
    return _this8;
  }

  return _createClass(RequestError);
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports.RequestError = RequestError;

var StartSessionError = /*#__PURE__*/function (_RequestError) {
  _inherits(StartSessionError, _RequestError);

  var _super9 = _createSuper(StartSessionError);

  function StartSessionError(message, code) {
    var _this9;

    _classCallCheck(this, StartSessionError);

    _this9 = _super9.call(this, message, code);
    _this9.name = 'StartSessionError';
    return _this9;
  }

  return _createClass(StartSessionError);
}(RequestError);

exports.StartSessionError = StartSessionError;

var JoinSessionError = /*#__PURE__*/function (_RequestError2) {
  _inherits(JoinSessionError, _RequestError2);

  var _super10 = _createSuper(JoinSessionError);

  function JoinSessionError(message, code) {
    var _this10;

    _classCallCheck(this, JoinSessionError);

    _this10 = _super10.call(this, message, code);
    _this10.name = 'JoinSessionError';
    return _this10;
  }

  return _createClass(JoinSessionError);
}(RequestError);

exports.JoinSessionError = JoinSessionError;

var LeaveSessionError = /*#__PURE__*/function (_RequestError3) {
  _inherits(LeaveSessionError, _RequestError3);

  var _super11 = _createSuper(LeaveSessionError);

  function LeaveSessionError(message, code) {
    var _this11;

    _classCallCheck(this, LeaveSessionError);

    _this11 = _super11.call(this, message, code);
    _this11.name = 'LeaveSessionError';
    return _this11;
  }

  return _createClass(LeaveSessionError);
}(RequestError);

exports.LeaveSessionError = LeaveSessionError;

var InviteToSessionError = /*#__PURE__*/function (_RequestError4) {
  _inherits(InviteToSessionError, _RequestError4);

  var _super12 = _createSuper(InviteToSessionError);

  function InviteToSessionError(message, code) {
    var _this12;

    _classCallCheck(this, InviteToSessionError);

    _this12 = _super12.call(this, message, code);
    _this12.name = 'InviteToSessionError';
    return _this12;
  }

  return _createClass(InviteToSessionError);
}(RequestError);

exports.InviteToSessionError = InviteToSessionError;

var CancelInviteToSessionError = /*#__PURE__*/function (_RequestError5) {
  _inherits(CancelInviteToSessionError, _RequestError5);

  var _super13 = _createSuper(CancelInviteToSessionError);

  function CancelInviteToSessionError(message, code) {
    var _this13;

    _classCallCheck(this, CancelInviteToSessionError);

    _this13 = _super13.call(this, message, code);
    _this13.name = 'CancelInviteToSessionError';
    return _this13;
  }

  return _createClass(CancelInviteToSessionError);
}(RequestError);

exports.CancelInviteToSessionError = CancelInviteToSessionError;

var SignalError = /*#__PURE__*/function (_RequestError6) {
  _inherits(SignalError, _RequestError6);

  var _super14 = _createSuper(SignalError);

  function SignalError(message, code) {
    var _this14;

    _classCallCheck(this, SignalError);

    _this14 = _super14.call(this, message, code);
    _this14.name = 'SignalError';
    return _this14;
  }

  return _createClass(SignalError);
}(RequestError);

exports.SignalError = SignalError;

var SessionJoinResponseError = /*#__PURE__*/function (_RequestError7) {
  _inherits(SessionJoinResponseError, _RequestError7);

  var _super15 = _createSuper(SessionJoinResponseError);

  function SessionJoinResponseError(message, code) {
    var _this15;

    _classCallCheck(this, SessionJoinResponseError);

    _this15 = _super15.call(this, message, code);
    _this15.name = 'SessionJoinResponseError';
    return _this15;
  }

  return _createClass(SessionJoinResponseError);
}(RequestError);

exports.SessionJoinResponseError = SessionJoinResponseError;

var DeclineInviteToSessionError = /*#__PURE__*/function (_RequestError8) {
  _inherits(DeclineInviteToSessionError, _RequestError8);

  var _super16 = _createSuper(DeclineInviteToSessionError);

  function DeclineInviteToSessionError(message, code) {
    var _this16;

    _classCallCheck(this, DeclineInviteToSessionError);

    _this16 = _super16.call(this, message, code);
    _this16.name = 'DeclineInviteToSessionError';
    return _this16;
  }

  return _createClass(DeclineInviteToSessionError);
}(RequestError);

exports.DeclineInviteToSessionError = DeclineInviteToSessionError;

var RemoveFromSessionError = /*#__PURE__*/function (_RequestError9) {
  _inherits(RemoveFromSessionError, _RequestError9);

  var _super17 = _createSuper(RemoveFromSessionError);

  function RemoveFromSessionError(message, code) {
    var _this17;

    _classCallCheck(this, RemoveFromSessionError);

    _this17 = _super17.call(this, message, code);
    _this17.name = 'RemoveFromSessionError';
    return _this17;
  }

  return _createClass(RemoveFromSessionError);
}(RequestError);

exports.RemoveFromSessionError = RemoveFromSessionError;

var AbortSessionJoinError = /*#__PURE__*/function (_RequestError10) {
  _inherits(AbortSessionJoinError, _RequestError10);

  var _super18 = _createSuper(AbortSessionJoinError);

  function AbortSessionJoinError(message, code) {
    var _this18;

    _classCallCheck(this, AbortSessionJoinError);

    _this18 = _super18.call(this, message, code);
    _this18.name = 'AbortSessionJoinError';
    return _this18;
  }

  return _createClass(AbortSessionJoinError);
}(RequestError);

exports.AbortSessionJoinError = AbortSessionJoinError;
//# sourceMappingURL=errors.js.map