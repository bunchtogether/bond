// @flow

export class RequestTimeoutError extends Error {
  constructor(message:string) {
    super(message);
    this.name = 'RequestTimeoutError';
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
