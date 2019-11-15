import {
  computed,
  get,
  set,
  action,
} from '@ember/object';
import {
  A
} from '@ember/array';
import Controller from '@ember/controller';
import { debug } from '@ember/debug';

//Good checkbox model described here:
//https://codeflip.przepiora.ca/blog/2014/05/22/ember-js-recipes-checkboxable-index-pages-using-itemcontroller/
//and here:
//https://alexdiliberto.com/posts/ember-toggle-all-checkbox/
//but both ObjectController and ArrayController are depreciated/superceded by controller
//so that sucks.

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

export default class RobotBulkPaymentController extends Controller {

  queryParams = ['schoolFilter', 'robotFilter'];
  selectedRobots = A();

  @computed('model', 'robotFilter', 'schoolFilter')
  get filteredRobots() {
    let returnRobots = get(this, 'model');
    let robotFilter = get(this, 'robotFilter');
    let schoolFilter = get(this, 'schoolFilter');
    let selectedRobots = get(this, 'selectedRobots');
    let regex;

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
    //Remove any selectedRobots that are no longer visible.
    selectedRobots.forEach(function(i) {
      if (!returnRobots.includes(i)) {
        selectedRobots.removeObject(i);
      }
    });
    //Return the results of the two filters.
    return returnRobots;
  }

  @computed('selectedRobots.[]')
  get invoicedTotal() {
    debug("computing invoiced total");
    let list = get(this, 'selectedRobots');
    return getTotalDollars(list, 'invoiced').toString();
  }

  @computed('selectedRobots.[]')
  get totalRobots() {
    return this.selectedRobots.length;
  }

  @computed('totalRobots')
  get isPayDisabled() {
    let count = get(this, 'totalRobots');
    return (count === 0);
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

  @action
  robotSelected(item) {
    debug("Checking: " + item.get('robot').toString());
    return this.selectedRobots.includes(item);
  }

  @action
  checkboxClicked(item) {
    let list = get(this, 'selectedRobots');
    if (list.includes(item)) {
      list.removeObject(item);
      debug("Removing: " + item.get('robot').toString());
    } else {
      list.addObject(item);
      debug("Adding: " + item.get('robot').toString());
    }
    // list.forEach(function(i) {
    //   console.log("list contains " + i.get('robot') + " $" + i.get('invoiced'));
    // });
    debug("total:" + getTotalDollars(list, 'invoiced'));
  }

  @action
  pay() {
    let list = get(this, 'selectedRobots');
    let total = get(this, 'invoicedTotal');
    if (window.confirm("Take payment of " + total + "?")) {
      list.forEach(function(i) {
        i.set('paid', i.get('invoiced'));
        debug("Marking " + i.get('robot') + " as paid.");
        i.save();
      });
      list.clear();
    }
  }
}
