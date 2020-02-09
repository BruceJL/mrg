import {
  computed,
  get,
  set,
  action,
} from '@ember/object';
import {
  A,
} from '@ember/array';
import Controller from '@ember/controller';
import {
  debug
} from '@ember/debug';

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

  @computed('model.robots.@each.paymentType')
  get coaches() {
    let coaches = {};
    let robots = get(this, 'model');
    robots.forEach((robot) => {
      if (coaches[robot.email] == null) {
        coaches[robot.email] = {};
        coaches[robot.email].entries = [];
        coaches[robot.email].name = robot.coach;
        coaches[robot.email].school = robot.school;
        coaches[robot.email].invoiced = 0.0;
        coaches[robot.email].email = robot.email;
      }
      coaches[robot.email].entries.push(robot);
      if (robot.paymentType === "INVOICED" &&
        robot.participated) {
        coaches[robot.email].invoiced += robot.invoiced;
      }
    });
    return coaches
  }

  @action
  invoiceAll(email) {
    debug("Invoicing all robots for " + email);
    let robots = get(this, 'model');
    robots.forEach((robot) => {
      if (robot.email === email) {
        if (robot.get('paymentType') == null) {
          robot.set('paymentType', "INVOICED");
        }
      }
    });
    robots.save();
  }
}
