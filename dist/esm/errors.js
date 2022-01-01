// $FlowFixMe
export class AbortError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AbortError';
  }

}
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
export class InvitationCancelledError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvitationCancelledError';
  }

}
export class InvitationDeclinedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvitationDeclinedError';
  }

}
export class InvitationTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvitationTimeoutError';
  }

}
export class InvitedUserLeftError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvitedUserLeftError';
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
export class CancelInviteToSessionError extends RequestError {
  constructor(message, code) {
    super(message, code);
    this.name = 'CancelInviteToSessionError';
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
export class DeclineInviteToSessionError extends RequestError {
  constructor(message, code) {
    super(message, code);
    this.name = 'DeclineInviteToSessionError';
  }

}
export class RemoveFromSessionError extends RequestError {
  constructor(message, code) {
    super(message, code);
    this.name = 'RemoveFromSessionError';
  }

}
//# sourceMappingURL=errors.js.map