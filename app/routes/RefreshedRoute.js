import {
  isNone
} from '@ember/utils';
import Route from '@ember/routing/route';
import Pollster from './pollster';
import { debug } from '@ember/debug';

export default class RefreshedRoute extends Route {
  activate(){
    if (isNone(this.pollster)) {
      let inst = this;
      debug("Activating route for " +
        inst.get('params').competition_id + "!");
      this.set('pollster', Pollster.create({
        onPoll: function() {
          debug("Model reload for " +
            inst.get('params').competition_id + "!");
          inst.get('store').findRecord('competition',
            inst.get('params').competition_id, {
              include: 'robot'
            });
        }
      }));
    }
    this.pollster.start();
  }

  // This is called upon exiting the Route
  deactivate(){
    debug("Deactivating route for " +
      this.params.competition_id + "!");
    this.pollster.stop();
  }
}
