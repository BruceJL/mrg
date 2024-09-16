import Controller from '@ember/controller';
import {
  action,
} from '@ember/object';
import { service } from '@ember/service';
import { Registry as Services } from '@ember/service';
import { EmberChangeset } from 'ember-changeset';
import CompetitionModel from 'mrg-sign-in/models/competition';
import DS from 'ember-data';

// @ts-ignore - Looks like ember-changeset is still not typescriptified.
import RobotValidation from '../../validations/robot';
import RobotModel from 'mrg-sign-in/models/robot';

export default class RobotEditController extends Controller {
  @service router!: Services['router'];
  @service declare store: DS.Store;

  RobotValidation = RobotValidation;

  @action
  done(competition: CompetitionModel) {
    this.router.transitionTo('competitions.show', competition);
  }

  @action
  save(changeset: EmberChangeset) {
    changeset.save();
  }

  @action
  rollback(changeset: EmberChangeset) {
    changeset.rollback();
  }

  @action
  updateCompetition(r: RobotModel, event: string) {
    let ok = confirm(
      "Changing the competition of this entry will cause the registration" +
      " of the entry to be reset to the current time, moving this entry to " +
      " the end of the stand-by queue. Are you Sure?"
    );
    if (ok) {
      const c: CompetitionModel = this.store.peekRecord('competition', event);
      r.registered = "now()";
      r.competition = c;
      r.save();
    }
  }
}
