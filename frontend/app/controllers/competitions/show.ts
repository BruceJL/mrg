import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import DS from 'ember-data';
import RobotModel from 'mrg-sign-in/models/robot';
import RefreshedController from '../RefreshedController';

export default class CompetitionShowController extends RefreshedController {
  @service declare store: DS.Store;

  queryParams = [
    'robotFilter',
  ];

  @tracked robotFilter = "";
  @tracked model: any;

  get filteredRobotsByName(): Array<RobotModel> {
    let robots: Array<RobotModel> = this.store.peekAll('robot').slice();;
    let robotFilter = this.robotFilter;
    let returnRobots = robots.sortBy('registered');
    let competitionId = this.model.id;

    returnRobots = returnRobots.filter((robot: RobotModel)=>{
      return (robot.competition.name === competitionId);
    });

    if (robotFilter && robotFilter.length > 1) {
      let regex = new RegExp(robotFilter, "i");
      return returnRobots.filter((robot) => {
        return regex.test(robot.name);
      });
    } else {
      return returnRobots;
    }
  }
}
