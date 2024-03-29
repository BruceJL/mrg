import RingAssignmentModel from 'mrg-sign-in/models/ring-assignment';
import RingAssignmentRoute from 'mrg-sign-in/routes/ring-assignments';
import { ModelFrom } from '../routes/ring-assignments';
import RefreshedController from './RefreshedController';

export default class RingAssignmentController extends RefreshedController {
  declare model: ModelFrom<RingAssignmentRoute>;

  get sortedAssignments(): Array<RingAssignmentModel> {
    return this.model.ringAssignment.slice().sortBy('robot.name');
  }
}

