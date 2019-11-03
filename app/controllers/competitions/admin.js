import {
  get
} from '@ember/object';
import Controller from '@ember/controller';

export default Controller.extend({

  actions: {
    setMeasurementTime() {
      var model = this.model;
      var robots = get(model, 'robots');
      robots.forEach(function(item) {
        // console.log("setting meausured of " + get(item, 'robot') + " to false");
        item.set('measured', false);
        item.save();
      });
      let date = new Date('1970-01-01T00:00:00Z');
      model.set('registrationTime', date);
      model.save().then(() => {
        model.reload();
      });
    },


    toggleProperty(property) {
      let competition = this.model;
      let b = competition.get(property, this.model);
      competition.set(property, !b);
      this.model.save();
    },

    toggleMeasureMass() {
      let competition = this.model;
      competition.set('measureMass', !competition.measureMass);
      this.model.save();
    },

    toggleMeasureSize() {
      let competition = this.model;
      competition.set('measureSize', !competition.measureMass);
      this.model.save();
    },
    toggleMeasureTime() {
      let competition = this.model;
      competition.set('measureTime', !competition.measureMass);
      this.model.save();
    },
    toggleMeasureScratch() {
      let competition = this.model;
      competition.set('measureScratch', !competition.measureMass);
      this.model.save();
    }
  }
});
