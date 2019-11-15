import Route from '@ember/routing/route';

export default class CompetitionRobotRoute extends Route {

  model(params) {
    var store = this.store;

    var robot = store.findRecord('robot', params.robot_id);
    //var competition = store.findAll('competition');
    return robot;
  }

  activate(controller) {
    //this._super(controller, model);
    controller.set('competitions', this.store.peekAll('competition'));
  }
}
