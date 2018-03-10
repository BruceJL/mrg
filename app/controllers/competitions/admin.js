import Ember from 'ember';

export default Ember.Controller.extend({

	actions: {
		setMeasurementTime(){
			var model = this.get('model');
			var robots = Ember.get(model, 'robots');
      robots.forEach(function(item){
        console.log("setting meausured of " + Ember.get(item, 'robot') + " to false");
        item.set('measured', false);
        item.save();
      });
      let date = new Date('1970-01-01T00:00:00Z');
      model.set('registrationTime', date);
      model.save().then(()=> {
        model.reload();
      });
	  }
  }
});
