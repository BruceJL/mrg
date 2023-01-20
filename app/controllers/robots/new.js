import {
  action,
  set,
  get,
} from '@ember/object';

import {
  debug,
} from '@ember/debug';

import { service } from '@ember/service';

import Controller from '@ember/controller';
import RobotValidation from '../../validations/robot';

export default class RobotNewController extends Controller {
  @service router;
  queryParams = ['competition'];
  RobotValidation = RobotValidation;

  setupNewRobot() {
    let competitionId = this.get('competition');
    let competitions = this.get('model.competitions');
    let competition = competitions.findBy('id', competitionId);

    debug("competitions are: " + competitions);
    debug("competition is " + competition + " from id: " + competitionId);

    let robot = this.get('model.robot');
    debug("robot is :" + robot);

    set(robot, 'tookPayment', " ");
    set(robot, 'paid', " ");
    set(robot, 'competition', competition);
    if (get(robot, 'competition') === "RC1") {
      set(robot, 'invoiced', "5.00");
    } else {
      set(robot, 'invoiced', "20.00");
    }
  }

  @action
  save(changeset) {
    changeset.save().then(() => {
      let id = changeset.get('id');
      debug("Robot id: " + id);
      this.router.transitionTo('robots.edit', id);
    });
  }
}
