import Ember from 'ember';

export default Ember.Route.extend({
  	model(){
  		this.get('store').findAll('robot', {reload: true});
    	return this.get('store').findAll('competition', {reload: true});
    	
	} 
});

