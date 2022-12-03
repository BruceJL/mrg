import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import {
    debug,
  } from '@ember/debug';

export default class Application extends Route {
    @service session;

    async beforeModel(transition) {
        // debug("Calling session setup()!");
        await this.session.setup();
        // debug("Returned from session setup()!");
        return super.beforeModel(transition);
      }
}