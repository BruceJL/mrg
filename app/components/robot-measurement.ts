import Component from '@glimmer/component';
import {
  action,
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
import DS from 'ember-data';

import RobotMeasurementModel from 'mrg-sign-in/models/measurement';
import RobotModel from 'mrg-sign-in/models/robot';

function isMeasured(
  measurements: DS.ManyArray<RobotMeasurementModel>,
  type: string,
  registrationTime: Date,
  passed: boolean,
): boolean{
  let done = false;
  let result: boolean = false;
  let itemType = "";
  let foundMeasurements = false;

  let measurementsArray = measurements.slice().sortBy('datetime').reverse();

  measurementsArray.forEach(function(item, index, array) {
    if (!done) {
      let itemDatetime = item.datetime;
      if (itemDatetime < registrationTime) {
        done = true;
        foundMeasurements = false;
        debug("passedMeasurement: No current measurements found for " + type);
      } else {
        itemType = item.type;
        if (type === itemType) {
          result = Boolean(item.result);
          debug("passedMeasurement: Found: " + result + " for " + type);
          done = true;
          foundMeasurements = true;
        }
      }
    }
  });
  if(foundMeasurements){
    return (passed == result);
  } else{
    return false;
  }
}

export interface ComponentSignature{
  Args:{
    data: RobotModel,
  }
}

export default class RobotMeasurementComponent extends Component<ComponentSignature> {
  @service declare store: DS.Store;


  constructor(owner: unknown, args: ComponentSignature['Args']){
    super(owner, args);
    this.competition = args.data.competition;
    this.measurements = args.data.measurement;
  }

  @tracked Mass = false
  @tracked Size = false
  @tracked Scratch = false
  @tracked Time = false
  @tracked Deadman = false
  @tracked competition = this.args.data.competition;
  @tracked measurements = this.args.data.measurement;


  @action
  PopulateRadioBoxes(model: RobotModel): void {
    debug("PopulateRadioBoxes fired");
    let registrationTime = this.competition.registrationTime;
    this.Mass = isMeasured(this.measurements, "Mass", registrationTime, true);
    this.Size = isMeasured(this.measurements, "Size", registrationTime, true);
    this.Scratch = isMeasured(this.measurements, "Scratch", registrationTime, true);
    this.Time = isMeasured(this.measurements, "Time", registrationTime, true);
    this.Deadman = isMeasured(this.measurements, "Deadman", registrationTime, true);
  }

  isMeasured(
    model: RobotModel,
    measurementName: string,
    value: boolean,
  ): boolean {
    let registrationTime = model.competition.registrationTime;
    return isMeasured(model.measurement, measurementName, registrationTime, value);
  }

  // Get the measurements required for this entry based upon the competition
  // that is it registered in.

  get requiredMeasurements(): Array<string> {
    return this.requiredMeasurementsfn();
  }

  requiredMeasurementsfn(): Array<string>{
    let comp = this.competition;
    let measurements = [];

    if(comp !== undefined){
      if (comp.measureMass) {
        measurements.push('Mass');
      }
      if (comp.measureSize) {
        measurements.push('Size');
      }
      if (comp.measureScratch) {
        measurements.push('Scratch');
      }
      if (comp.measureTime) {
        measurements.push('Time');
      }
      if (comp.measureDeadman) {
        measurements.push('Deadman');
      }
    }
    return measurements;
  }

  @action
  createMeasurement(
    value: boolean,
    type: string,
    model: RobotModel,
  ): void {
    let robot = model;
    debug("Logging " + type + " measurement of: " + value + " for robot " + robot.id);
    //this.set(type, value);
    let measurement: RobotMeasurementModel = this.store.createRecord(
      'measurement', {
        robot: robot,
        result: value,
        type: type.toString(),
      }
    );

    measurement.save().then(() => {
      measurement.reload();

      let measurements = this.measurements;
      let registrationTime = this.competition.registrationTime;
      let measured = true;

      this.requiredMeasurementsfn().forEach(function(item) {
        if (isMeasured(measurements, item, registrationTime, false)) {
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
