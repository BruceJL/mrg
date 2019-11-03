import {
  isNone
} from '@ember/utils';
import Route from '@ember/routing/route';
import Pollster from './pollster';

export default Route.extend({
  model(params) {
    this.set('params', params);
    return this.store.findRecord('competition',
      params.competition_id, {
        include: 'robot'
      });
  },

  activate: function() {
    //this._super(controller, model);
    if (isNone(this.pollster)) {
      var inst = this;
      // console.log("Creating Pollster for " +
        // inst.get('params').competition_id + "!");
      this.set('pollster', Pollster.create({
        onPoll: function() {
          // console.log("Model reload for " +
            // inst.get('params').competition_id + "!");
          inst.get('store').findRecord('competition',
            inst.get('params').competition_id, {
              include: 'robot'
            });
        }
      }));
    }
    this.pollster.start();
  },

  // This is called upon exiting the Route
  deactivate: function() {
    // console.log("Deactivating route for " +
      // this.params.competition_id + "!");
    this.pollster.stop();
  }
});
