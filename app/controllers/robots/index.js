import {
  computed,
  get,
	action,
} from '@ember/object';
import Controller from '@ember/controller';

function formatDollars(amount) {
  if (amount > 0) {
    let formatted = parseFloat(amount, 10).toFixed(2);
    return '$' + formatted;
  } else {
    return "";
  }
}

function getTotalDollars(items, property) {
  let total = 0.0;
  items.forEach(function(item) {
    total += Number(item.get(property));
  });
  return formatDollars(total);
}

export default class RobotIndexController extends Controller {

  queryParams = ['schoolFilter', 'robotFilter', 'robotIDFilter'];

  @computed('model', 'robotFilter', 'schoolFilter', 'robotIDFilter')
  get filteredRobots() {
    let returnRobots = get(this, 'model');
    let robotFilter = get(this, 'robotFilter');
    let schoolFilter = get(this, 'schoolFilter');
    let robotIDFilter = get(this, 'robotIDFilter');
    let regex;

    if (robotIDFilter && robotIDFilter.length > 2) {
      returnRobots = returnRobots.filter(function(i) {
        if (i.get('id') === robotIDFilter) {
          return true;
        } else {
          return false;
        }
      });
    } else {

      if (schoolFilter && schoolFilter.length > 1) {
        regex = new RegExp(schoolFilter, "i");
        returnRobots = returnRobots.filter(function(item) {
          let data = item.get('school');
          return regex.test(data);
        });
      }

      if (robotFilter && robotFilter.length > 1) {
        regex = new RegExp(robotFilter, "i");
        returnRobots = returnRobots.filter(function(item) {
          let data = item.get('robot');
          return regex.test(data);
        });
      }
    }

    //Return the results of the two filters.
    return returnRobots;
  }

  @computed('filteredRobots')
  get invoicedTotal() {
    let items = get(this, 'filteredRobots');
    return getTotalDollars(items, 'invoiced');
  }

  @computed('filteredRobots')
  get paidTotal() {
    let items = get(this, 'filteredRobots');
    return getTotalDollars(items, 'paid');
  }

  @action
  selectCompetition(value) {
    if (value === 'All') {
      value = "";
    }
    this.set('competition', value);
    if (value) {
      this.transitionToRoute('robots', {
        queryParams: {
          'competition': value
        }
      });
    }
  }
}
