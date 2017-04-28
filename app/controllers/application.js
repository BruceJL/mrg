import Ember from 'ember';

export default Ember.Controller.extend({
	session: Ember.inject.service('session'),

 	actions:{
 		invalidateSession(){
 			this.get('session').invalidate();
 		},

 		authenticate() {
      		let { identification } = this.getProperties('identification');
      		this.get('session').authenticate('authenticator:simple', identification).catch((reason) => {
        		this.set('errorMessage', reason.error || reason);
        	});
      	},
 	}
});