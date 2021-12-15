// @flow

import type { Client } from '@bunchtogether/braid-client'
import EventEmitter from 'events';
import { 
  ANNOUNCE
} from './constants';

type Logger = {
  debug: (string | number, ...any) => void,
  info: (string | number, ...any) => void,
  warn: (string | number, ...any) => void,
  error: (string | number, ...any) => void,
  errorStack: (error:Error | MediaError) => void
};

export default class Bond extends EventEmitter {
  
  constructor(braidClient: Client, name:string, logger?: Logger) {
    super();
    this.name = name;
    this.braidClient = braidClient;
    this.ready = this.init();
    this.logger = logger || braidClient.logger;
  }

  handleMessage(message:Buffer) {
    console.log(message);
  }

  async init() {
    try {
      await Promise.all([
        this.braidClient.startPublishing(this.name),
        this.braidClient.addServerEventListener(this.name, this.handleMessage.bind(this))
      ]);
    } catch(error) {
      this.braidClient.logger.error(`Unable to join ${this.name}`);
      throw error;
    }
    this.braidClient.publish(name, {
      type: ANNOUNCE
    });
  }

  async close() {
    try {
      await Promise.all([
        this.braidClient.stopPublishing(name),
        this.braidClient.removeServerEventListener(this.name)
      ]);
    } catch(error) {
      this.braidClient.logger.error(`Unable to join ${this.name}`);
      throw error;
    }
  }
}

