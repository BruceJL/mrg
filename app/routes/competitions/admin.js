import Route from '@ember/routing/route';

export default class CompetitionAdminRoute extends Route {

  model(params) {
    var store = this.store;
    this.set('params', params);
    return store.findRecord('competition',
      params.competition_id, {
        include: 'robot'
      });
  }
}
