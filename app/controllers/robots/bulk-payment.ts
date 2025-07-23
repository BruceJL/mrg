import { action } from '@ember/object';
import { debug } from '@ember/debug';
import RobotsBulkPaymentRoute, {
  type ModelFrom,
} from '../../routes/robots/bulk-payment';
import RefreshedController from '../RefreshedController';
import type RobotModel from 'mrg-sign-in/models/robot';

//Good checkbox model described here:
//https://codeflip.przepiora.ca/blog/2014/05/22/ember-js-recipes-checkboxable-index-pages-using-itemcontroller/
//and here:
//https://alexdiliberto.com/posts/ember-toggle-all-checkbox/
//but both ObjectController and ArrayController are depreciated/superceded by controller
//so that sucks.

export default class RobotBulkPaymentController extends RefreshedController {
  declare model: ModelFrom<RobotsBulkPaymentRoute>;

  get coaches(): { [Identifier: string]: any } {
    const coaches: { [Identifier: string]: any } = {};
    const robots: Array<RobotModel> = this.model;
    robots.forEach((robot: RobotModel) => {
      if (coaches[robot.email] == null) {
        coaches[robot.email] = {};
        coaches[robot.email].entries = [];
        coaches[robot.email].name = robot.coach;
        coaches[robot.email].school = robot.school;
        coaches[robot.email].totalInvoicedFee = 0.0; // fee summation of all INVOICED and PARTICIPATED robots
        coaches[robot.email].email = robot.email;
      }
      coaches[robot.email].entries.push(robot);
      if (robot.paymentType === 'INVOICED' && robot.participated) {
        coaches[robot.email].totalInvoicedFee += robot.fee;
      }
    });
    return coaches;
  }

  @action
  invoiceAll(email: string) {
    debug('Invoicing all robots for ' + email);
    const robots: Array<RobotModel> = this.model;
    robots.forEach((robot) => {
      if (robot.email === email) {
        if (robot.paymentType === 'UNPAID') {
          robot.paymentType = 'INVOICED';
          robot.save();
        }
      }
    });
  }
}
