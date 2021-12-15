// @flow


export class JoinRoomError extends Error {
  constructor(message:string) {
    super(message);
    this.name = 'JoinRoomError';
  }
}
