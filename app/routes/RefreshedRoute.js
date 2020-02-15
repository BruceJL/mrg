//How to do imports illustrated best at:
//https://stackoverflow.com/questions/24417725/defining-custom-ember-object-in-ember-cli

//The following update routine is stolen and cleaned up a bit from:
//http://yoranbrondsema.com/live-polling-system-ember-js/

import {
  isNone,
} from '@ember/utils';
import Route from '@ember/routing/route';

import {
  debug
} from '@ember/debug';

import {
  get,
  computed,
} from '@ember/object';

import EmberObject from '@ember/object';

import {
  later,
  cancel
} from '@ember/runloop';

class Pollster extends EmberObject {
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


export default class RefreshedRoute extends Route {
  activate() {
    if (isNone(this.pollster)) {
      // Need to make a reference to this object, because this will have a
      // differnt context within the Pollster.
      let inst = this;

      // Get the parameters passed to the page.
      if(inst.get('params') === undefined){
        inst.set('pollster', Pollster.create({
          onPoll: function() {
            debug("Model reload for all robots!");
            inst.get('store').findAll('robot');
          }
        }));
      }else{
        let competition = inst.get('params').competition_id
        inst.set('pollster', Pollster.create({
          onPoll: function() {
            debug("Model reload for " + competition + "!");
            inst.get('store').findRecord('competition',
              competition, {
                include: 'robot'
              });
          }
        }));
      }
    }
    this.pollster.start();
  }

  // This is called upon exiting the Route
  deactivate() {
    this.pollster.stop();
  }
}
