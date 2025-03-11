import { service } from '@ember/service';
import type { Registry as Services } from '@ember/service';
import Route from '@ember/routing/route';
import RobotModel from 'mrg-sign-in/models/robot';

export default class RobotsNewRoute extends Route {
  @service declare store: Services['store'];

  setUpRobot(robot: RobotModel) {
    robot.name = "N/A";
    robot.driver1 = "N/A";
    robot.coach = "N/A";
    robot.email = "N/A";
    robot.ph = "N/A";
  }

  async model(params: any):Promise<RobotModel> {
    const store = this.store;
    const robot = await store.createRecord('robot');
    robot.competition =  await store.findRecord('competition', params.competition);

    this.setUpRobot(robot); // set default values to remind user of required fields

    return robot;
  }

}
