import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    var store = this.store;

    var robot = store.findRecord('robot',  params.robot_id);
    //var competition = store.findAll('competition');
    return robot;
  },

  activate: function(controller) {
      //this._super(controller, model);
      controller.set('competitions', this.store.peekAll('competition'));
    }
});
