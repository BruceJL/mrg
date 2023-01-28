import Transition from '@ember/routing/transition';
import { inject as service } from '@ember/service';
import DS from 'ember-data';
import AuthenticatedRoute from './authenticated';


export default class Application extends AuthenticatedRoute {
    @service declare store: DS.Store;

    async beforemodel(transition: Transition){
        super.beforeModel(transition);
        await this.session.setup();
    }
}