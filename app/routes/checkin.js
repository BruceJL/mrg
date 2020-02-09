import {
  isNone
} from '@ember/utils';
import RefreshedRoute from './RefreshedRoute';
import {
  debug,
} from '@ember/debug';

export default class CheckinRoute extends RefreshedRoute {
  model(params) {
    this.set('params', params);
    return this.store.findRecord('competition',
      params.competition_id, {
        include: 'robot'
      });
  }
}
