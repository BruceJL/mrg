import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import DS from 'ember-data';
//import EmberSimpleAuthSession from 'ember-simple-auth/session';


export default class Application extends Route {
    @service declare store: DS.Store;
    //@service session!: EmberSimpleAuthSession;

    async beforeModel(transition: any) {
        // debug("Calling session setup()!");
        //await this.session.setup();
        // debug("Returned from session setup()!");
        return super.beforeModel(transition);
      }
}