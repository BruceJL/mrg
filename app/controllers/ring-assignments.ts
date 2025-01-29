import RingAssignmentRoute from 'mrg-sign-in/routes/ring-assignments';
import type { ModelFrom } from '../routes/ring-assignments';
import RefreshedController from './RefreshedController';
import { tracked } from '@glimmer/tracking';

export default class RingAssignmentController extends RefreshedController {
  declare model: ModelFrom<RingAssignmentRoute>;
}
