import {
  isNone
} from '@ember/utils';
import Route from '@ember/routing/route';
import Pollster from './pollster';

export default Route.extend({
  model(params) {
    this.store.findAll('robot');
    this.store.findAll('ring-assignment', params.competition_id);
    return this.store.find('competition', params.competition_id);
  },

  activate: function(controller, model) {
    this._super(controller, model);
    if (isNone(this.pollster)) {
      var inst = this;
      this.set('pollster', Pollster.create({
        onPoll: function() {
          console.log("Model reload!");
          inst.get('store').findAll('robot');
        }
      }));
    }
    this.pollster.start();
  },

  // This is called upon exiting the Route
  deactivate: function() {
    this.pollster.stop();
  }
});
