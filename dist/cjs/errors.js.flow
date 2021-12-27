// @flow

// $FlowFixMe
export class AbortError extends Error {
  constructor(message:string) {
    super(message);
    this.name = 'AbortError';
  }
}

export class RequestTimeoutError extends Error {
  constructor(message:string) {
    super(message);
    this.name = 'RequestTimeoutError';
  }
}

export class ClientClosedError extends Error {
  constructor(message:string) {
    super(message);
    this.name = 'ClientClosedError';
  }
}

export class InvitationDeclinedError extends Error {
  constructor(message:string) {
    super(message);
    this.name = 'InvitationDeclinedError';
  }
}

export class InvitationTimeoutError extends Error {
  constructor(message:string) {
    super(message);
    this.name = 'InvitationTimeoutError';
  }
}

export class RequestError extends Error {
  declare code: number;

  constructor(message:string, code:number) {
    super(message);
    this.name = 'RequestError';
    this.code = code;
  }
}

export class StartSessionError extends RequestError {
  constructor(message:string, code:number) {
    super(message, code);
    this.name = 'StartSessionError';
  }
}

export class JoinSessionError extends RequestError {
  constructor(message:string, code:number) {
    super(message, code);
    this.name = 'JoinSessionError';
  }
}

export class LeaveSessionError extends RequestError {
  constructor(message:string, code:number) {
    super(message, code);
    this.name = 'LeaveSessionError';
  }
}

export class InviteToSessionError extends RequestError {
  constructor(message:string, code:number) {
    super(message, code);
    this.name = 'InviteToSessionError';
  }
}

export class SignalError extends RequestError {
  constructor(message:string, code:number) {
    super(message, code);
    this.name = 'SignalError';
  }
}

export class SessionJoinResponseError extends RequestError {
  constructor(message:string, code:number) {
    super(message, code);
    this.name = 'SessionJoinResponseError';
  }
}

export class DeclineInviteToSessionError extends RequestError {
  constructor(message:string, code:number) {
    super(message, code);
    this.name = 'DeclineInviteToSessionError';
  }
}
