import Ember from 'ember';

//The following update routine is stolen and cleaned up a bit from:
//http://yoranbrondsema.com/live-polling-system-ember-js/
const Pollster = Ember.Object.extend({
  interval: function() {
    return 5000; // Time between polls (in ms)
  }.property().readOnly(),

  // Schedules the function `f` to be executed every `interval` time.
  schedule: function(f) {
    return Ember.run.later(this, function() {
      f.apply(this);
      this.set('timer', this.schedule(f));
    }, this.get('interval'));
  },

  // Stops the pollster
  stop: function() {
    Ember.run.cancel(this.get('timer'));
  },

  // Starts the pollster, i.e. executes the `onPoll` function every interval.
  start: function() {
    this.set('timer', this.schedule(this.get('onPoll')));
  },

  onPoll: function(){
    // Issue JSON request and add data to the store
  }
});

export default Ember.Route.extend({
	model(){
    this.get('store').findAll('competition', {reload: true});
		return this.get('store').findAll('robot', {reload: true});
	},

  setupController: function(controller, model) {
    this._super(controller, model);
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

    controller.set('competitions', this.get('store').findAll('competition'));
  },

  // This is called upon exiting the Route
  deactivate: function() {
    this.get('pollster').stop();
  },  
});

