import {
  set,
  computed,
} from '@ember/object';
import Controller from '@ember/controller';

import RobotValidation from '../../validations/robot';

export default Controller.extend({
  RobotValidation,

  measurementOptions: computed(function(){
    return ['Mass', 'Size', 'Time', 'Scratch']; // Time between polls (in ms)
  }),

  selectedMeasurementOption: 'Mass',

  updateCompetition(changeset, id) {
    let competition = this.store.peekRecord('competition', id);
    changeset.set('competition', competition);
  },

  changeRobotStatus(property, value) {
    let model = this.model;
    // console.log("changing " + property + " to " + value);
    set(model, property, value);
    model.save();
  },

  createMeasurement(value) {
    let robot = this.model;
    let type = this.selectedMeasurementOption;
    let date = new Date('1970-01-01T00:00:00Z');
    // console.log("Logging " + type + " measurement of: " + value + " for robot " + robot.id);
    let measurement = this.store.createRecord('robot-measurement', {
      robot: robot,
      result: value,
      type: type.toString(),
      datetime: date
    });

    measurement.save().then(() => {
      let model = this.model;
      // console.log("Robot measured has id: " + model.id);
      measurement.reload();

      //Determine if a robot is fully measured
      let measuredMass = "Fail";
      let lastMeasuredMassTime = false;

      let measuredSize = "Fail";
      let lastMeasuredSizeTime = false;

      let measuredTime = "Fail";
      let lastMeasuredTimeTime = false;

      let measuredScratch = "Fail";
      let lastMeasuredScratchTime = false;

      let measurements = model.get('measurements');

      //Get all latest measurements for the robot
      measurements.forEach(function(item) {
        let type = item.get('type');
        let datetime = item.get('datetime');
        let result = item.get('result');

        if (type === "Mass") {
          if (lastMeasuredMassTime === false || datetime > lastMeasuredMassTime) {
            lastMeasuredMassTime = datetime;
            measuredMass = result;
          }
        } else if (type === "Time") {
          if (lastMeasuredTimeTime === false || datetime > lastMeasuredTimeTime) {
            lastMeasuredTimeTime = datetime;
            measuredTime = result;
          }
        } else if (type === "Scratch") {
          if (lastMeasuredScratchTime === false || datetime > lastMeasuredScratchTime) {
            lastMeasuredScratchTime = datetime;
            measuredScratch = result;
          }
        } else if (type === "Size") {
          if (lastMeasuredSizeTime === false || datetime > lastMeasuredSizeTime) {
            lastMeasuredSizeTime = datetime;
            measuredSize = result;
          }
        }
      });

      let competition = model.get('competition');

      let requiresMass = competition.get('measureMass');
      let requiresSize = competition.get('measureSize');
      let requiresTime = competition.get('measureTime');
      let requiresScratch = competition.get('measureScratch');

      let registrationTime = competition.get('registrationTime');
      let measured = true;

      if (requiresMass &&
        (registrationTime > lastMeasuredMassTime || measuredMass === "Fail")) {
        // console.log("Failed on mass");
        measured = false;
      }
      if (requiresSize &&
        (registrationTime > lastMeasuredSizeTime || measuredSize === "Fail")) {
        // console.log("failed on size");
        measured = false;
      }
      if (requiresTime &&
        (registrationTime > lastMeasuredTimeTime || measuredTime === "Fail")) {
        // console.log("failed on time delay");
        measured = false;
      }
      if (requiresScratch &&
        (registrationTime > lastMeasuredScratchTime || measuredScratch === "Fail")) {
        // console.log("failed on scratch");
        measured = false;
      }
      model.set('measured', measured);
      // console.log("Setting measured to " + measured);
      model.save();
    });
  },

  actions: {
    done() {
      history.back();
    },

    updateMeasurement(value) {
      this.set('measurementType', value);
    },

    paid5Dollars(changeset) {
      changeset.set('paid', 5.00);
      changeset.save();
    },

    paid10Dollars(changeset) {
      changeset.set('paid', 10.00);
      changeset.save();
    },

    refund(changeset) {
      changeset.set('paid', 0.00);
      changeset.save();
    },

    signIn(changeset) {
      changeset.set('signedIn', true);
      changeset.save();
    },

    signOut(changeset) {
      changeset.set('signedIn', false);
      changeset.save();
    },

    toggleMeasured(changeset) {
      changeset.toggleProperty('measured');
      changeset.save();
    },

    withdraw(changeset) {
      // console.log("withdrawing!");
      changeset.set('withdrawn', true);
      changeset.save();
    },

    reinstate(changeset) {
      // console.log("reinstating!");
      changeset.set('withdrawn', false);
      changeset.save();
    },

    // updateCompetition(changeset, id) {
    //   this.sendAction('updateCompetition', changeset, id);
    // },

    //Ember-changeset methods
    save(changeset) {
      // console.log("Saving changeset");
      changeset.save();
    },

    rollback(changeset) {
      // console.log("edit.js rollback");
      changeset.rollback();
    },

    measurementPass(model) {
      this.createMeasurement("Pass", model);
    },

    measurementFail(model) {
      this.createMeasurement("Fail", model);
    }
  }
});
