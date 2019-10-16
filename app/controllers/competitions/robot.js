import {
  get,
  set
} from '@ember/object';
import Controller from '@ember/controller';

import RobotValidation from '../../validations/robot';

export default Controller.extend({
  RobotValidation,
  competition: null,
  queryParams: ['competition'],

  actions: {
    done() {
      var model = this.model;
      var competition = get(model, 'competition');
      this.transitionToRoute('competitions.show', competition);
      //history.back();
    },

    updateCompetition(changeset, id) {
      var competition = this.store.peekRecord('competition', id);
      changeset.set('competition', competition);
    },

    changeRobotStatus(property, value) {
      set(this.model, property, value);
      this.model.save();
    }
  }
});
