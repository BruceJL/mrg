import {
  get,
  action,
} from '@ember/object';
import Controller from '@ember/controller';
import { debug } from '@ember/debug';

export default class CompetitionAdminController extends Controller {

  @action
  setMeasurementTime() {
    let model = this.model;
    let robots = get(model, 'robots');
    robots.forEach(function(item) {
      debug("setting meausured of " + get(item, 'robot') + " to false");
      item.set('measured', false);
      item.save();
    });
    let date = new Date('1970-01-01T00:00:00Z');
    model.set('registrationTime', date);
    model.save().then(() => {
      model.reload();
    });
  }

  @action
  toggleProperty(property) {
    debug('Entering toggleProperty!');
    let competition = this.model;
    let b = competition.get(property, this.model);
    competition.set(property, !b);
    this.model.save();
  }

  @action
  toggleMeasureMass() {
    let competition = this.model;
    competition.set('measureMass', !competition.measureMass);
    this.model.save();
  }

  @action
  toggleMeasureSize() {
    let competition = this.model;
    competition.set('measureSize', !competition.measureMass);
    this.model.save();
  }

  @action
  toggleMeasureTime() {
    let competition = this.model;
    competition.set('measureTime', !competition.measureMass);
    this.model.save();
  }

  @action
  toggleMeasureScratch() {
    let competition = this.model;
    competition.set('measureScratch', !competition.measureMass);
    this.model.save();
  }
}
