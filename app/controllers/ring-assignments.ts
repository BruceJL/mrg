import RingAssignmentModel from 'mrg-sign-in/models/ring-assignment';
import RingAssignmentRoute from 'mrg-sign-in/routes/ring-assignments';
import type { ModelFrom } from '../routes/ring-assignments';
import RefreshedController from './RefreshedController';

export default class RingAssignmentController extends RefreshedController {
  declare model: ModelFrom<RingAssignmentRoute>;

  get sortedAssignments(): Array<RingAssignmentModel> {
    return this.model.ringAssignment
      .slice()
      .sort((a, b) =>
        a.robot.name > b.robot.name ? 1 : b.robot.name > a.robot.name ? -1 : 0,
      );
  }
}
