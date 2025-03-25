import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import RobotModel from 'mrg-sign-in/models/robot';
import CompetitionModel from 'mrg-sign-in/models/competition';
import RefreshedController from '../RefreshedController';
import type { Registry as Services } from '@ember/service';

export default class CompetitionShowController extends RefreshedController {
  @service declare store: Services['store'];

  queryParams = ['robotFilter'];

  @tracked robotFilter = '';
  @tracked model: CompetitionModel;

  get isRoundRobin() {
    return ['MSR', 'MS1', 'MS2', 'MS3', 'MSA', 'PST', 'PSA'].includes(
      this.model.id,
    );
  }

  get filteredRobotsByName(): Array<RobotModel> {
    const robots: Array<RobotModel> = this.store.peekAll('robot').slice();
    const robotFilter = this.robotFilter;
    let returnRobots = robots.sort((a, b) =>
      a.registered > b.registered ? 1 : b.registered > a.registered ? -1 : 0,
    );

    const competitionId = this.model.id;

    returnRobots = returnRobots.filter((robot: RobotModel) => {
      if (robot.competition) {
        return robot.competition.name === competitionId;
      }
    });

    if (robotFilter && robotFilter.length > 1) {
      const regex = new RegExp(robotFilter, 'i');
      return returnRobots.filter((robot: RobotModel) => {
        return regex.test(robot.name);
      });
    } else {
      return returnRobots;
    }
  }
}
