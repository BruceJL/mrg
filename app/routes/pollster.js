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
export default class Pollster extends EmberObject {
  name = 'Pollster';

  @computed
  get interval(){
    return 4000; // Time between polls (in ms)
  }

  // Schedules the function `f` to be executed every `interval` time.
  schedule(f) {
    return later(this, function() {
      f.apply(this);
      this.set('timer', this.schedule(f));
    }, this.interval);
  }

  // Stops the pollster
  stop(){
    cancel(this.timer);
  }

  // Starts the pollster, i.e. executes the `onPoll` function every interval.
  start() {
    this.set('timer', this.schedule(this.onPoll));
  }

  onPoll() {
    // Issue JSON request and add data to the store
  }
}
