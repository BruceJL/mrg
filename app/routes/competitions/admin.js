import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    var store = this.store;
    this.set('params', params);
    return store.findRecord('competition',
      params.competition_id, {
        include: 'robot'
      });
  }
});
