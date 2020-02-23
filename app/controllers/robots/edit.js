import Controller from '@ember/controller';
import {
  action,
} from '@ember/object';
import RobotValidation from '../../validations/robot';

export default class RobotEditController extends Controller {
  RobotValidation = RobotValidation;

  @action
  done(competition) {
    this.transitionToRoute('competitions.show', competition);
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
