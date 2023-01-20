import Controller from '@ember/controller';
import {
  action,
} from '@ember/object';
import { service } from '@ember/service';

import RobotValidation from '../../validations/robot';

export default class RobotEditController extends Controller {
  @service router;
  RobotValidation = RobotValidation;

  @action
  done(competition) {
    this.router.transitionTo('competitions.show', competition);
  }

  @action
  save(changeset) {
    changeset.save();
  }

  @action
  rollback(changeset) {
    changeset.rollback();
  }
};
