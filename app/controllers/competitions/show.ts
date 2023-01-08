import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import DS from 'ember-data';


export default class CompetitionShowController extends Controller {
  @service declare store: DS.Store;

  queryParams = [
    'robotFilter',
  ];

  @tracked robotFilter = "";

  get filteredRobotsByName(): Array<any> {
    let robots = this.store.peekAll('robot').slice();;
    let robotFilter = this.robotFilter;
    let returnRobots = robots.sortBy('registered');

    if (robotFilter && robotFilter.length > 1) {
      let regex = new RegExp(robotFilter, "i");
      return returnRobots.filter(function(item) {
        let data = item.get('name');
        return regex.test(data);
      });
    } else {
      return returnRobots;
    }
  }
}
