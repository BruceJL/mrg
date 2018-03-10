import Ember from 'ember';


export default Ember.Component.extend({

	createMeasurement(value, obj){
		console.log("Logging measurement of: " + value);
		var model = Ember.get(this, 'model');
		var store = Ember.get(this, 'store');
		var measurement = store.createRecord('robot-measurment',
		{
			robot: model.id,
			result: value,
			type: this.get('measurementType')
		});
		model.save();
	},

	actions: {
		paid5Dollars(changeset){
			changeset.set('paid', 5.00);
			changeset.save();
		},

		paid10Dollars(changeset){
			changeset.set('paid', 10.00);
			changeset.save();
		},

		refund(changeset){
			changeset.set('paid', 0.00);
			changeset.save();
		},

		signIn(changeset){
			changeset.set('signedIn', true);
		    changeset.save();
		},

		signOut(changeset){
			changeset.set('signedIn', false);
			changeset.save();
		},

		toggleMeasured(changeset){
			changeset.toggleProperty('measured');
			changeset.save();
		},

		withdraw(changeset){
    		changeset.set('withdrawn', true);
    		changeset.save();
    	},

    	reinstate(changeset){
    		changeset.set('withdrawn', false);
    		changeset.save();
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
		},

		measurementPass(model){
			this.createMeasurement("Pass", model);
		},

		measurementFail(Model){
			this.createMeasurement("Fail", model);
		}
	}
});
