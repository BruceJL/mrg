import Route from '@ember/routing/route';
import Transition from '@ember/routing/transition';
import { inject as service } from '@ember/service';


export default class Application extends Route {
    @service declare session: any; //EmberSimpleAuthSession

    beforemodel(transition: Transition){
        super.beforeModel(transition);
        this.session.setup();
        this.session.requireAuthentication(transition, 'login');
    }
}