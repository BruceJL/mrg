import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class FlashMessageService extends Service {
  @tracked message = '';
  @tracked type: 'success' | 'error' = 'error';

  show(message: string, type: 'success' | 'error' = 'error', duration = 2000) {
    this.message = message;
    this.type = type;

    setTimeout(() => {
      this.clear();
    }, duration);
  }

  clear() {
    this.message = '';
    this.type = 'error';
  }
}

declare module '@ember/service' {
  interface Registry {
    'flash-message': FlashMessageService;
  }
}
