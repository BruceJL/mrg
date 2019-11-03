import {
  later,
  cancel
} from '@ember/runloop';
import EmberObject from '@ember/object';
import { computed } from '@ember/object';


//How to do imports illustrated best at:
//https://stackoverflow.com/questions/24417725/defining-custom-ember-object-in-ember-cli

//The following update routine is stolen and cleaned up a bit from:
//http://yoranbrondsema.com/live-polling-system-ember-js/
export default EmberObject.extend({
  name: 'Pollster',

  interval: computed(function(){
    return 4000; // Time between polls (in ms)
  }),

  // Schedules the function `f` to be executed every `interval` time.
  schedule: function(f) {
    return later(this, function() {
      f.apply(this);
      this.set('timer', this.schedule(f));
    }, this.interval);
  },

  // Stops the pollster
  stop: function() {
    cancel(this.timer);
  },

  // Starts the pollster, i.e. executes the `onPoll` function every interval.
  start: function() {
    this.set('timer', this.schedule(this.onPoll));
  },

  onPoll: function() {
    // Issue JSON request and add data to the store
  }
});
