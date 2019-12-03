import Component from '@ember/component';
import {
  action,
} from '@ember/object';
import {
  tracked,
} from '@glimmer/tracking';
import {
  debug,
} from '@ember/debug';

export default class RobotCheckinController extends Component {

  @action
  save(changeset) {
    console.log("Saving changeset");
    changeset.save();
  }

  @action
  withdraw(changeset) {
    changeset.set('withdrawn', true); //Depreciated
    changeset.set('status', "WITHDRAWN")
    changeset.save();
  }

  @action
  reinstate(changeset) {
    changeset.set('withdrawn', false); //depreciated
    changeset.set('status', "UNKNOWN")
    changeset.save();
  }

  @action
  checkIn(changeset) {
    changeset.set('signedIn', true); //depreciated
    changeset.set('status', "CHECKED-IN")
    changeset.save();
  }

  @action
  cancelCheckin(changeset) {
    changeset.set('signedIn', false); //depreciated
    changeset.set('status', "UNKNOWN")
    changeset.save();
  }

  @action
  paid5Dollars(changeset) {
    changeset.set('paid', 5.00);
    changeset.save();
  }

  @action
  paid10Dollars(changeset) {
    changeset.set('paid', 10.00);
    changeset.save();
  }

  @action
  refund(changeset) {
    changeset.set('paid', 0.00);
    changeset.save();
  }
}
