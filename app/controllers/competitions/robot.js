import {
  get,
  set
} from '@ember/object';
import Controller from '@ember/controller';
import { debug } from '@ember/debug';

import RobotValidation from '../../validations/robot';

export default class CompetitionRootController extends Controller {

  //RobotValidation;
  competition = null;
  queryParams = ['competition'];

  @action
  done() {
    let model = this.model;
    let competition = get(model, 'competition');
    this.transitionToRoute('competitions.show', competition);
    //history.back();
  }

  @action
  updateCompetition(changeset, id) {
    let competition = this.store.peekRecord('competition', id);
    changeset.set('competition', competition);
  }
}
