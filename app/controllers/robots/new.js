import Ember from 'ember';
import RobotValidation from '../../validations/robot';	

export default Ember.Controller.extend({
	queryParams: ['competition'],

	RobotValidation,

	//TODO figure out how to make a changeset visible here, which it 
	//normally isn't, because the changeset isn't setup until after
	//the page is rendered. Once that's done, call changeset.validate
	//to make all of the required fields red immediatly.

	//init: function () {
    //	this._super();
    //	Ember.run.schedule("afterRender", this, function() {
    //  		this.send("validate");
    //	});
  	//},

	actions: {
		save(changeset){
  			changeset.save().then(() => {
  				var id = changeset.get('id');
  				console.log("Robot id: " + id);
  				this.transitionToRoute('competitions.robot', id);
 			});
  		},

  		updateCompetition(changeset, id){
			var comp = this.get('store').peekRecord('competition', id);    	
			changeset.set('comp', comp);			
		},

		validate(){
			var changeset = Ember.get(this, 'changeset');
			changeset.validate();
		}
	}
});