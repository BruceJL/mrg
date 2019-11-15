import {
  computed,
  get,
} from '@ember/object';
import Controller from '@ember/controller';
import { debug } from '@ember/debug';

export default class CompetitionShowController extends Controller {

  queryParams = ['robotFilter'];

  //Filter the currently displayed robots by robot name
  @computed('model', 'robotFilter')
  get filteredRobotsByName() {
    let model = get(this, 'model')
    let returnRobots = get(model, 'robots');
    let robotFilter = this.robotFilter;

    if (robotFilter && robotFilter.length > 1) {
      let regex = new RegExp(robotFilter, "i");
      return returnRobots.filter(function(item) {
        let data = item.get('robot');
        return regex.test(data);
      });
    } else {
      debug("returning: " + returnRobots);
      return returnRobots;
    }
  }
}
