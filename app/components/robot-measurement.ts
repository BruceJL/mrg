import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { debug } from '@ember/debug';
import { inject as service } from '@ember/service';

import RobotMeasurementModel from 'mrg-sign-in/models/measurement';
import RobotModel from 'mrg-sign-in/models/robot';

function isMeasured(
  measurements: Array<RobotMeasurementModel>,
  type: string, // Measurement type e.g. Mass, size, etc.
  registrationTime: Date, // Time where measurements before are invalid.
  passed: boolean, //are we looking for true or false?
): boolean {
  let done = false;
  let result: boolean = false;
  let itemType = '';
  let foundMeasurements = false;

  const measurementsArray = measurements.slice();
  [...measurementsArray].sort((a, b) =>
    a.datetime > b.datetime ? 1 : b.datetime > a.datetime ? -1 : 0,
  );

  measurementsArray.forEach(function (
    item: RobotMeasurementModel,
    _index: number,
    _array,
  ) {
    if (!done) {
      const itemDatetime = item.datetime;
      if (itemDatetime < registrationTime) {
        done = true;
        foundMeasurements = false;
        debug('passedMeasurement: No current measurements found for ' + type);
      } else {
        itemType = item.type;
        if (type === itemType) {
          result = Boolean(item.result);
          debug('passedMeasurement: Found: ' + result + ' for ' + type);
          done = true;
          foundMeasurements = true;
        }
      }
    }
  });
  if (foundMeasurements) {
    return passed == result;
  } else {
    return false;
  }
}

export interface ComponentSignature {
  Args: {
    data: RobotModel;
  };
}

export default class RobotMeasurementComponent extends Component<ComponentSignature> {
  @service declare store: DS.Store;

  constructor(owner: unknown, args: ComponentSignature['Args']) {
    super(owner, args);
    this.competition = args.data.competition;
    this.measurements = args.data.measurement;
  }

  @tracked Mass = false;
  @tracked Size = false;
  @tracked Scratch = false;
  @tracked Time = false;
  @tracked Deadman = false;
  @tracked competition = this.args.data.competition;
  @tracked measurements = this.args.data.measurement;

  @action
  PopulateRadioBoxes(model: RobotModel): void {
    debug('PopulateRadioBoxes fired');
    const registrationTime = this.competition.registrationTime;
    this.Mass = isMeasured(this.measurements, 'Mass', registrationTime, true);
    this.Size = isMeasured(this.measurements, 'Size', registrationTime, true);
    this.Scratch = isMeasured(
      this.measurements,
      'Scratch',
      registrationTime,
      true,
    );
    this.Time = isMeasured(this.measurements, 'Time', registrationTime, true);
    this.Deadman = isMeasured(
      this.measurements,
      'Deadman',
      registrationTime,
      true,
    );
  }

  // This function is called by the radio boxes on the page to populate
  // their values.
  isMeasured(
    model: RobotModel,
    measurementName: string,
    value: boolean,
  ): boolean {
    const registrationTime = model.competition.registrationTime;
    return isMeasured(
      model.measurement,
      measurementName,
      registrationTime,
      value,
    );
  }

  // Get the measurements required for this entry based upon the competition
  // that is it registered in.

  get requiredMeasurements(): Array<string> {
    return this.requiredMeasurementsfn();
  }

  requiredMeasurementsfn(): Array<string> {
    const comp = this.competition;
    const measurements = [];

    if (comp !== undefined) {
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
  createMeasurement(value: boolean, type: string, robot: RobotModel): void {
    debug(
      'Logging ' +
        type +
        ' measurement of: ' +
        value +
        ' for robot ' +
        robot.id,
    );
    //this.set(type, value);
    const measurement: RobotMeasurementModel = this.store.createRecord(
      'measurement',
      {
        robot: robot,
        result: value,
        type: type.toString(),
      },
    );

    measurement.save().then(() => {
      measurement.reload();
      robot.reload();
    });
  }
}
