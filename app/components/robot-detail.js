import Component from '@ember/component';
import {
  action
} from '@ember/object';
import {
  debug
} from '@ember/debug';

export default class RobotDetailController extends Component {

  @action
  updateCompetition(changeset, event) {
    debug("got competition change to " + event);
    let ok = confirm(
      "Changing the competition of this entry will cause the registration" +
      " of the entry to be reset to the current time, moving this entry to " +
      " the end of the stand-by queue. Are you Sure?"
    );
    if (ok) {
      const id = event;
      const c = this.competitions.findBy('id', id);
      changeset.set('competition', c);
      changeset.set('registered', null);
    }else{
      changeset.rollback();
    }
  }
}
