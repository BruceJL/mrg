import { action } from '@ember/object';
import Controller from '@ember/controller';
import { debug } from '@ember/debug';
import RobotsBulkPaymentRoute, { ModelFrom } from '../../routes/robots/bulk-payment';

//Good checkbox model described here:
//https://codeflip.przepiora.ca/blog/2014/05/22/ember-js-recipes-checkboxable-index-pages-using-itemcontroller/
//and here:
//https://alexdiliberto.com/posts/ember-toggle-all-checkbox/
//but both ObjectController and ArrayController are depreciated/superceded by controller
//so that sucks.


export default class RobotBulkPaymentController extends Controller {
  declare model: ModelFrom<RobotsBulkPaymentRoute>;

  get coaches(): {[Identifier: string]: any}{
    let coaches: {[Identifier: string]: any} = {};
    let robots = this.model
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
  invoiceAll(email: string) {
    debug("Invoicing all robots for " + email);
    let robots = this.model;
    robots.forEach((robot) => {
      if (robot.email === email) {
        if (robot.paymentType === "UNPAID") {
          robot.paymentType = "INVOICED";
          robot.save();
        }
      }
    });
  }
}
