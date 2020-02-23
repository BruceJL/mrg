import {
  isNone
} from '@ember/utils';

import RefreshedRoute from '../RefreshedRoute';

export default class CompetitionShowRoute extends RefreshedRoute {
  model(params) {
    let store = this.store;
    this.set('params', params);

    return store.findRecord('competition',
      params.competition_id, {
        include: 'robot'
      });
  }
}
