import Route from '@ember/routing/route';

export default class CompetitionIndexRoute extends Route {

  model() {
    this.store.findAll('robot', {
      reload: true
    });
    return this.store.findAll('competition', {
      reload: true
    });
  }
}
