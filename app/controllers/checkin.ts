import RobotModel from 'mrg-sign-in/models/robot';
import CheckinRoute from 'mrg-sign-in/routes/checkin';
import type { ModelFrom } from '../routes/checkin';
import RefreshedController from './RefreshedController';

export default class CheckInController extends RefreshedController {
  declare model: ModelFrom<CheckinRoute>;

  get sortedAssignments(): Array<RobotModel> {
    return this.model.robot
      .slice()
      .sort((a, b) => (a.name < b.name ? 1 : b.name < a.name ? -1 : 0));
  }
}
