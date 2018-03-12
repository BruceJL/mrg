import Ember from 'ember';
import Pollster from '../pollster';

export default Ember.Route.extend({
	model(){
    this.get('store').findAll('competition', {reload: true});
		return this.get('store').findAll('robot', {reload: true});
	},

  activate: function(controller, model) {
    //this._super(controller, model);
    if (Ember.isNone(this.get('pollster'))) {
      var inst = this;
      this.set('pollster', Pollster.create({
        onPoll: function() {
          console.log("Model reload!");
          inst.get('store').findAll('robot');
        }
      }));
    }
    this.get('pollster').start();

    this.set('competitions', this.get('store').findAll('competition'));
  },

  // This is called upon exiting the Route
  deactivate: function() {
    this.get('pollster').stop();
  },
});
