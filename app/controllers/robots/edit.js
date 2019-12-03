import Controller from '@ember/controller';
import Changeset from 'ember-changeset';
import {
  action,
  set,
  get,
  computed,
} from '@ember/object';

export default class RobotEditController extends Controller {
  @action
  done() {
    history.back();
  }

  @action
  rollback(changeset) {
    console.log("edit.js rollback");
    changeset.rollback();
  }
};
