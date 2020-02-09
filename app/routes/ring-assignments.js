import {
  isNone
} from '@ember/utils';
import RefreshedRoute from './RefreshedRoute';
import { debug } from '@ember/debug';

export default class RingAssignmentRoute extends RefreshedRoute {
  model(params) {
    this.store.findAll('robot');
    this.store.findAll('ring-assignment', params.competition_id);
    return this.store.find('competition', params.competition_id);
  }
}
