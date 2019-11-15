import Controller from '@ember/controller';
import Changeset from 'ember-changeset';
import {
  action,
  set,
  get,
  computed,
} from '@ember/object';

import RobotValidation from '../../validations/robot';

export default class RobotEditController extends Controller {

  RobotValidation = RobotValidation;

  @computed()
  get measurementOptions() {
    return ['Mass', 'Size', 'Time', 'Scratch']; // Time between polls (in ms)
  }

  selectedMeasurementOption = 'Mass';

  changeRobotStatus(property, value) {
    let model = this.model.robot;
    console.log("changing " + property + " to " + value);
    set(model, property, value);
    model.save();
  }

  createMeasurement(value) {
    let robot = this.model.robot;
    let type = this.selectedMeasurementOption;
    let date = new Date('1970-01-01T00:00:00Z');
    console.log("Logging " + type + " measurement of: " + value + " for robot " + robot.id);
    let measurement = this.store.createRecord('robot-measurement', {
      robot: robot,
      result: value,
      type: type.toString(),
      datetime: date,
    });

    measurement.save().then(() => {
      let model = this.model.robot;
      console.log("Robot measured has id: " + model.id);
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
        console.log("Failed on mass");
        measured = false;
      }
      if (requiresSize &&
        (registrationTime > lastMeasuredSizeTime || measuredSize === "Fail")) {
        console.log("failed on size");
        measured = false;
      }
      if (requiresTime &&
        (registrationTime > lastMeasuredTimeTime || measuredTime === "Fail")) {
        console.log("failed on time delay");
        measured = false;
      }
      if (requiresScratch &&
        (registrationTime > lastMeasuredScratchTime || measuredScratch === "Fail")) {
        console.log("failed on scratch");
        measured = false;
      }
      model.set('measured', measured);
      console.log("Setting measured to " + measured);
      model.save();
    });
  }

  @action
  updateCompetition(changeset, e) {
    let value = e.target.value;
    let competition = this.store.peekRecord('competition', value);
    changeset.set('competition', competition);
  }

  @action
  done() {
    history.back();
  }

  @action
  updateMeasurement(value) {
    this.set('measurementType', value);
  }

  @action
  paid5Dollars(changeset) {
    changeset.set('paid', 5.00);
    changeset.save();
  }

  @action
  paid10Dollars(changeset) {
    changeset.set('paid', 10.00);
    changeset.save();
  }

  @action
  refund(changeset) {
    changeset.set('paid', 0.00);
    changeset.save();
  }

  @action
  signIn(changeset) {
    changeset.set('signedIn', true);
    changeset.save();
  }

  @action
  signOut(changeset) {
    changeset.set('signedIn', false);
    changeset.save();
  }

  @action
  toggleMeasured(changeset) {
    changeset.toggleProperty('measured');
    changeset.save();
  }

  @action
  withdraw(changeset) {
    console.log("withdrawing!");
    changeset.set('withdrawn', true);
    changeset.save();
  }

  @action
  reinstate(changeset) {
    console.log("reinstating!");
    changeset.set('withdrawn', false);
    changeset.save();
  }

  //Ember-changeset methods
  @action
  save(changeset) {
    console.log("Saving changeset");
    changeset.save();
  }

  @action
  rollback(changeset) {
    console.log("edit.js rollback");
    changeset.rollback();
  }

  @action
  measurementPass(model) {
    this.createMeasurement("Pass", model);
  }

  @action
  measurementFail(model) {
    this.createMeasurement("Fail", model);
  }
};
