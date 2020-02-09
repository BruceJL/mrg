import {
  computed,
  get,
} from '@ember/object';
import Controller from '@ember/controller';
import {
  debug,
} from '@ember/debug';
import {
  hasMany,
} from '@ember-data/model';

export default class CompetitionShowController extends Controller {

  queryParams = ['robotFilter'];

  @computed('model.robots.@each', 'robotFilter')
  get filteredRobotsByName() {
    let model = this.get('model');
    let robotFilter = this.robotFilter;
    let returnRobots = model.get('robots').sortBy('registered');

    if (robotFilter && robotFilter.length > 1) {
      let regex = new RegExp(robotFilter, "i");
      return returnRobots.filter(function(item) {
        let data = item.get('robot');
        return regex.test(data);
      });
    } else {
      return returnRobots;
    }
  }
}
