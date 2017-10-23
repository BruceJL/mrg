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
	model(params) {
		console.log("moving to: " + params.competition_id);
    var store = this.get('store');
    //TODO figure out a way to load just the robots for a given competition.
    //store.findAll('robot');
		return store.findRecord('competition', params.competition_id, {include: 'robot'});
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
  },

   	  // This is called upon exiting the Route
  	deactivate: function() {
	    this.get('pollster').stop();
  	}
  });