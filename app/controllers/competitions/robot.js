import {
  get,
} from '@ember/object';
import Controller from '@ember/controller';
import RobotValidation from '../../validations/robot';
import { service } from '@ember/service';




export default class CompetitionRootController extends Controller {
  @service router;

  //RobotValidation;
  competition = null;
  queryParams = ['competition'];

  @action
  done() {
    let model = this.model;
    let competition = get(model, 'competition');
    this.router.transitionTo('competitions.show', competition);
    //history.back();
  }

  @action
  updateCompetition(changeset, id) {
    let competition = this.store.peekRecord('competition', id);
    changeset.set('competition', competition);
  }
}
