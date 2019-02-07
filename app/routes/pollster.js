import Ember from 'ember';

//How to do imports illustrated best at:
//https://stackoverflow.com/questions/24417725/defining-custom-ember-object-in-ember-cli

//The following update routine is stolen and cleaned up a bit from:
//http://yoranbrondsema.com/live-polling-system-ember-js/
export default Ember.Object.extend({
  name: 'Pollster',

  interval: function() {
    return 4000; // Time between polls (in ms)
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
