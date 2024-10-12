import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type { Registry as Services } from '@ember/service';
import { EmberChangeset } from 'ember-changeset';
import CompetitionModel from 'mrg-sign-in/models/competition';

import RobotValidation from '../../validations/robot';
import RobotModel from 'mrg-sign-in/models/robot';

export default class RobotEditController extends Controller {
  @service router!: Services['router'];
  @service declare store: Services['store'];

  RobotValidation = RobotValidation;

  @action
  done(competition: CompetitionModel) {
    this.router.transitionTo('competitions.show', competition);
  }

  @action
  save(changeset: EmberChangeset) {
    return changeset.save();
  }

  @action
  rollback(changeset: EmberChangeset) {
    return changeset.rollback();
  }

  @action
  updateCompetition(r: RobotModel, event: string) {
    const ok = confirm(
      'Changing the competition of this entry will cause the registration' +
        ' of the entry to be reset to the current time, moving this entry to ' +
        ' the end of the stand-by queue. Are you Sure?',
    );
    if (ok) {
      this.store.findRecord('competition', event).then((c) => {
        r.registered = 'now()';
        r.competition = c;
        r.save();
      });
    }
  }
}
