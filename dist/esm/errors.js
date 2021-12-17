export class RequestTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RequestTimeoutError';
  }

}
export class RequestError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'RequestError';
    this.code = code;
  }

}
//# sourceMappingURL=errors.js.map