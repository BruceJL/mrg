import Component from '@ember/component';
import {
  action,
  computed,
} from '@ember/object';
import {
  tracked,
} from '@glimmer/tracking';
import {
  debug,
} from '@ember/debug';
import {
  inject as service,
} from '@ember/service';

function passedMeasurement(measurements, type, registrationTime) {
  let done = false;
  let result = undefined;
  let itemType = "";
  let itemDatetime = "";

  measurements = measurements.slice().sortBy('datetime').reverse();
  measurements.forEach(function(item, index, array) {
    if (!done) {
      itemDatetime = item.get('datetime');
      if (itemDatetime < registrationTime) {
        done = true;
        debug("passedMeasurement: No current measurements found for " + type);
      } else {
        itemType = item.get('type');
        if (type === itemType) {
          result = item.get('result');
          debug("passedMeasurement: Found: " + result + " for " + type);
          done = true;
        }
      }
    }
  });
  return result;
}

export default class RobotMeasurementComponent extends Component {
  @service store;

  @tracked Mass = false
  @tracked Size = false
  @tracked Scratch = false
  @tracked Time = false
  @tracked Deadman = false

  @action
  PopulateRadioBoxes(model) {
    debug("PopulateRadioBoxes fired");
    let registrationTime = model.get('competition').get('registrationTime');
    let measurements = model.get('measurement');
    this.Mass = passedMeasurement(measurements, "Mass", registrationTime);
    this.Size = passedMeasurement(measurements, "Size", registrationTime);
    this.Scratch = passedMeasurement(measurements, "Scratch", registrationTime);
    this.Time = passedMeasurement(measurements, "Time", registrationTime);
    this.Deadman = passedMeasurement(measurements, "Deadman", registrationTime);
  }

  isMeasured(model, measurementName, value){
    //dubugger;
    let registrationTime = model.get('competition').get('registrationTime');
    let measurements = model.get('measurement');
    let v = passedMeasurement(measurements, measurementName, registrationTime);
    return v & value;
  }

  // Get the measurements required for this entry based upon the competition
  // that is it registered in.
  @computed
  get requiredMeasurements() {
    let measurements = [];
    let comp = this.get('data').get('competition');

    if (comp.get('measureMass')) {
      measurements.push('Mass');
    }
    if (comp.get('measureSize')) {
      measurements.push('Size');
    }
    if (comp.get('measureScratch')) {
      measurements.push('Scratch');
    }
    if (comp.get('measureTime')) {
      measurements.push('Time');
    }
    if (comp.get('measureDeadman')) {
      measurements.push('Deadman');
    }
    return measurements;
  }

  @action
  createMeasurement(value, type, model) {
    let robot = model;
    debug("Logging " + type + " measurement of: " + value + " for robot " + robot.id);
    //this.set(type, value);
    let measurement = this.store.createRecord('measurement', {
      robot: robot,
      result: value,
      type: type.toString(),
    });

    measurement.save().then(() => {
      measurement.reload();

      let measurements = robot.get('measurement');
      let competition = robot.get('competition');
      let registrationTime = competition.get('registrationTime');
      let measured = true;

      this.requiredMeasurements.forEach(function(item) {
        if (!passedMeasurement(measurements, item, registrationTime)) {
          measured = false;
          debug("failed on " + item);
        }
      });

      debug("Setting measured to " + measured);
      robot.set('measured', measured);
      robot.save();
    });
  }
}
