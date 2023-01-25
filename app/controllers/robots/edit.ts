import Controller from '@ember/controller';
import {
  action,
} from '@ember/object';
import { service } from '@ember/service';
import { Registry as Services } from '@ember/service';
import { EmberChangeset } from 'ember-changeset';
import CompetitionModel from 'mrg-sign-in/models/competition';

// @ts-ignore - Looks like ember-changeset is still not typescriptified.
import RobotValidation from '../../validations/robot';

export default class RobotEditController extends Controller {
  @service router!: Services['router'];
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
};
