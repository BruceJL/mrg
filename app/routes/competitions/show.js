import {
  isNone
} from '@ember/utils';
import RefreshedRoute from  '../RefreshedRoute';
import { debug } from '@ember/debug';

export default class CompetitionShowRoute extends RefreshedRoute {
  model(params) {
    debug("Changing route to: " + params.competition_id);
    let store = this.store;
    this.set('params', params);
    return store.findRecord('competition',
      params.competition_id, {
        include: 'robot'
      });
  }
}
