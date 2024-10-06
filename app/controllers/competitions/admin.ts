import { action } from '@ember/object';

import { debug } from '@ember/debug';

import Controller from '@ember/controller';
import CompetitionModel from 'mrg-sign-in/models/competition';
import { EmberChangeset } from 'ember-changeset';

export default class CompetitionAdminController extends Controller {
  @action
  toggleMeasurement(
    competition: CompetitionModel,
    property:
      | 'measureDeadman'
      | 'measureScratch'
      | 'measureTime'
      | 'measureSize'
      | 'measureMass',
  ): void {
    debug('Entering toggleProperty!');
    const b = competition[property];
    debug('Setting ' + property + ' to ' + !b);
    competition[property] = !b;
    competition.save();
  }

  @action
  resetMeasurementTime(model: CompetitionModel): void {
    const ok = confirm(
      'This will cause all robot in this competition to be ' +
        'marked as &quot;not measured&quot; and set the competition ' +
        "'Measurement Start Time'; to right now. This is useful when " +
        'a reweigh of robots is required.',
    );

    // let robots = model.robot;
    // robots.forEach((item) => {
    //   debug("setting meausured of " + item.name + " to false");
    //   item.set('measured', false);
    //   item.save();
    // });

    model.set('registrationTime', 'now()');
    model.save().then(() => {
      model.reload();
    });
  }

  @action
  save(changeset: EmberChangeset): void {
    changeset.save();
  }

  @action
  rollback(changeset: EmberChangeset): void {
    changeset.rollback();
  }
}
