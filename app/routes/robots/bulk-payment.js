import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    this.store.findAll('competition', {
      reload: true
    });
    return this.store.findAll('robot', {
      reload: true
    });
  }
});
