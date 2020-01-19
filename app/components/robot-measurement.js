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


export default class RobotCheckinController extends Component {
  selectedMeasurementOption = 'Mass';

  @service store;

  @computed()
  get measurementOptions() {
    return ['Mass', 'Size', 'Time', 'Scratch', 'Deadman'];
  }

  @action
  updateMeasurement(value) {
    this.set('measurementType', value);
  }

  @action
  measurementPass(model) {
    this.createMeasurement("Pass", model);
  }

  @action
  measurementFail(model) {
    this.createMeasurement("Fail", model);
  }

  @action
  toggleMeasured(changeset) {
    changeset.toggleProperty('measured');
    changeset.save();
  }

  createMeasurement(value, model) {
    let robot = model;
    let type = this.selectedMeasurementOption;
    let date = new Date('1970-01-01T00:00:00Z');
    debug("Logging " + type + " measurement of: " + value + " for robot " + robot.id);
    let measurement = this.store.createRecord('robot-measurement', {
      robot: robot,
      result: value,
      type: type.toString(),
      datetime: date,
    });

    measurement.save().then(() => {
      debug("Robot measured has id: " + robot.id);
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

      let measurements = robot.get('measurements');

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

      let competition = robot.get('competition');

      let requiresMass = competition.get('measureMass');
      let requiresSize = competition.get('measureSize');
      let requiresTime = competition.get('measureTime');
      let requiresScratch = competition.get('measureScratch');
      let requireDeadman = competition.get('measureDeadman')

      let registrationTime = competition.get('registrationTime');
      let measured = true;

      if (requiresMass &&
        (registrationTime > lastMeasuredMassTime || measuredMass === "Fail")) {
        debug("Failed on mass");
        measured = false;
      }
      if (requiresSize &&
        (registrationTime > lastMeasuredSizeTime || measuredSize === "Fail")) {
        debug("failed on size");
        measured = false;
      }
      if (requiresTime &&
        (registrationTime > lastMeasuredTimeTime || measuredTime === "Fail")) {
        debug("failed on time delay");
        measured = false;
      }
      if (requiresScratch &&
        (registrationTime > lastMeasuredScratchTime || measuredScratch === "Fail")) {
        debug("failed on scratch");
        measured = false;
      }
      if (requiresScratch &&
        (registrationTime > lastMeasuredScratchTime || measureDeadman === "Fail")) {
        debug("failed on deadman");
        measured = false;
      }
      robot.set('measured', measured);
      debug("Setting measured to " + measured);
      robot.save();
    });
  }
}
