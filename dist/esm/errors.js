export class RequestTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RequestTimeoutError';
  }

}
export class ClientClosedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ClientClosedError';
  }

}
export class RequestError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'RequestError';
    this.code = code;
  }

}
export class StartSessionError extends RequestError {
  constructor(message, code) {
    super(message, code);
    this.name = 'StartSessionError';
  }

}
export class JoinSessionError extends RequestError {
  constructor(message, code) {
    super(message, code);
    this.name = 'JoinSessionError';
  }

}
export class LeaveSessionError extends RequestError {
  constructor(message, code) {
    super(message, code);
    this.name = 'LeaveSessionError';
  }

}
export class InviteToSessionError extends RequestError {
  constructor(message, code) {
    super(message, code);
    this.name = 'InviteToSessionError';
  }

}
export class SignalError extends RequestError {
  constructor(message, code) {
    super(message, code);
    this.name = 'SignalError';
  }

}
export class SessionJoinResponseError extends RequestError {
  constructor(message, code) {
    super(message, code);
    this.name = 'SessionJoinResponseError';
  }

}
//# sourceMappingURL=errors.js.map