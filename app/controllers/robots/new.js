import {
	action,
} from '@ember/object';

import Controller from '@ember/controller';
import RobotValidation from '../../validations/robot';
import { debug } from '@ember/debug';

export default class RobotNewController extends Controller {
  queryParams = ['competition'];

  RobotValidation = RobotValidation;

  //TODO figure out how to make a changeset visible here, which it
  //normally isn't, because the changeset isn't setup until after
  //the page is rendered. Once that's done, call changeset.validate
  //to make all of the required fields red immediatly.

  //init: function () {
  //  this._super();
  //  Ember.run.schedule("afterRender", this, function() {
  //      this.send("validate");
  //  });
  //},

  @action
  save(changeset) {
    changeset.save().then(() => {
      let id = changeset.get('id');
      debug("Robot id: " + id);
      this.transitionToRoute('competitions.robot', id);
    });
  }

  @action
  updateCompetition(changeset, id) {
    let competition = this.store.peekRecord('competition', id);
    changeset.set('competition', competition);
  }

  @action
  validate() {
    let changeset = this.changeset;
    changeset.validate();
  }
}
