import Ember from 'ember';
import Pollster from './pollster';

export default Ember.Route.extend({
	model(params) {
     this.set('params', params);
	   return this.get('store').findRecord('competition',
       params.competition_id, {include: 'robot'});
	},

	activate: function(controller, model) {
    	//this._super(controller, model);
    	if (Ember.isNone(this.get('pollster'))) {
       		var inst = this;
          console.log("Creating Pollster for " +
            inst.get('params').competition_id + "!");
        	this.set('pollster', Pollster.create({
          		onPoll: function() {
                console.log("Model reload for " +
                  inst.get('params').competition_id + "!");
                inst.get('store').findRecord('competition',
                  inst.get('params').competition_id, {include: 'robot'});
          		}
        	}));
      	}
   		this.get('pollster').start();
   	},

   	  // This is called upon exiting the Route
  	deactivate: function() {
      console.log("Deactivating route for " +
        this.get('params').competition_id + "!");
	    this.get('pollster').stop();
  	}
});
