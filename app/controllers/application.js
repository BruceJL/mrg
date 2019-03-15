import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
	session: service('session'),

 	actions:{
 		invalidateSession(){
 			this.session.invalidate();
 		},

 		authenticate() {
      		let { identification } = this;
      		this.session.authenticate('authenticator:simple', identification).catch((reason) => {
        		this.set('errorMessage', reason.error || reason);
        	});
      	},
 	}
});