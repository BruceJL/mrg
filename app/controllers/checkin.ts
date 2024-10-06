import RobotModel from 'mrg-sign-in/models/robot';
import CheckinRoute from 'mrg-sign-in/routes/checkin';
import type { ModelFrom } from '../routes/checkin';
import RefreshedController from './RefreshedController';

export default class CheckInController extends RefreshedController {
  declare model: ModelFrom<CheckinRoute>;

  get sortedAssignments(): Array<RobotModel> {
    return this.model.robot.slice().sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  }
}
