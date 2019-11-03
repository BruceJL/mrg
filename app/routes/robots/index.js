import {
  isNone
} from '@ember/utils';
import Route from '@ember/routing/route';
import Pollster from '../pollster';

export default Route.extend({
  model() {
    this.store.findAll('competition', {
      reload: true
    });
    return this.store.findAll('robot', {
      reload: true
    });
  },

  activate: function() {
    //this._super(controller, model);
    if (isNone(this.pollster)) {
      var inst = this;
      this.set('pollster', Pollster.create({
        onPoll: function() {
          // console.log("Model reload!");
          inst.get('store').findAll('robot');
        }
      }));
    }
    this.pollster.start();

    this.set('competitions', this.store.findAll('competition'));
  },

  // This is called upon exiting the Route
  deactivate: function() {
    this.pollster.stop();
  },
});
