import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type { Registry as Services } from '@ember/service';
import { EmberChangeset } from 'ember-changeset';
import CompetitionModel from 'mrg-sign-in/models/competition';
import RobotModel from 'mrg-sign-in/models/robot';
import RobotValidation from '../../validations/robot';

export default class RobotEditController extends Controller {
  @service router!: Services['router'];
  @service declare store: Services['store'];

  RobotValidation = RobotValidation;

  @action
  deleteRobot(robot: RobotModel) {
    const ok = confirm('Are you sure you want to delete this entry?');

    if (!ok) return;

    robot.deleteRecord();
    robot.save();
    this.router.transitionTo('robots.index');
  }

  @action
  done(competition: CompetitionModel) {
    this.router.transitionTo('competitions.show', competition);
  }

  @action
  save(changeset: EmberChangeset) {
    if (changeset.isValid) {
      return changeset.save();
    }else{
      alert('Invalid Rrobot Entry');
      return;
    }
  }

  @action
  rollback(changeset: EmberChangeset) {
    return changeset.rollback();
  }

  @action
  updateCompetition(r: RobotModel, event: Event) {
    const competitionId = (event.target as HTMLInputElement).value;
    const ok = confirm(
      'Changing the competition of this entry will cause the registration' +
        ' of the entry to be reset to the current time, moving this entry to ' +
        ' the end of the stand-by queue. Are you Sure?',
    );
    if (ok) {
      this.store.findRecord('competition', competitionId).then((c) => {
        r.registered = 'now()';
        r.competition = c;
        r.save();
      });
    }
  }
}
