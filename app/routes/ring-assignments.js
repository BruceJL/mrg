import Ember from 'ember';
import Pollster from './pollster';

export default Ember.Route.extend({
	model(params) {
		this.get('store').findAll('robot');
		this.get('store').findAll('ring-assignment');
	  return this.get('store').find('competition', params.competition_id);
	},

	activate: function(controller, model) {
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
