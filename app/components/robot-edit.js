import Ember from 'ember';


export default Ember.Component.extend({
	actions: {
		paid5Dollars(){
			//this.sendAction('changeRobotStatus', 'paid', 5.00);
			Ember.set(this.get('changeset'), 'paid', 5.00);
			this.get('changeset').save();
		},

		paid10Dollars(){
			//this.sendAction('changeRobotStatus', 'paid', 10.00);
			Ember.set(this.get('changeset'), 'paid', 10.00);
			this.get('changeset').save();
		},                 

		refund(){
			//this.sendAction('changeRobotStatus', 'paid', 0.00);
			Ember.set(this.get('changeset'), 'paid', 0.00);
			this.get('changeset').save();
		},

		signIn(changeset){
			//this.sendAction('changeRobotStatus', 'signedIn', true);
			changeset.set('signedIn', true);
		    changeset.save();
		},

		signOut(changeset){
			//this.sendAction('changeRobotStatus', 'signedIn', false);
			changeset.set('signedIn', false);
			changeset.save()
		},

		toggleMeasured(changeset){
			//this.sendAction('changeRobotStatus', 'measured', function(){
			this.get('changeset').toggleProperty('measured');
			this.get('changeset').save();
		},

		withdraw(changeset){
    		changeset.set('withdrawn', true)
    		changeset.save()
    	},

    	reinstate(changeset){
    		changeset.set('withdrawn', false)
    		changeset.save()
    	},

		done(){
			this.sendAction('done');
		},

		updateCompetition(changeset, id){
    		this.sendAction('updateCompetition', changeset, id);
    	},
	
		//Ember-changeset methods
		save(changeset){
			changeset.save();
		},

		rollback(changeset){
			console.log("edit.js rollback");
			changeset.rollback();
		}
	}
});