import Controller from '@ember/controller';
import Changeset from 'ember-changeset';
import {
  action,
} from '@ember/object';

export default class RobotEditController extends Controller {
  @action
  done(competition) {
    this.transitionToRoute('competitions.show', competition);
  }

  @action
  rollback(changeset) {
    console.log("edit.js rollback");
    changeset.rollback();
  }
};
