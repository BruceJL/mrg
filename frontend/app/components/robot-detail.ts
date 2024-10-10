import Component from '@glimmer/component';
import { EmberChangeset } from 'ember-changeset';
import {
  action
} from '@ember/object';
import {
  debug
} from '@ember/debug';

import DS from 'ember-data';

import {
  inject as service
} from '@ember/service';

export default class RobotDetailController extends Component {
  @service declare store: DS.Store;

  @action
  updateCompetition(changeset: EmberChangeset, event: string) {
    debug("got competition change to " + event);
    let ok = confirm(
      "Changing the competition of this entry will cause the registration" +
      " of the entry to be reset to the current time, moving this entry to " +
      " the end of the stand-by queue. Are you Sure?"
    );
    if (ok) {
      const id = event;
      const c = this.store.peekRecord('competition', id);
      changeset.set('competition', c);
      changeset.set('registered', null);
    }else{
      changeset.rollback();
    }
  }
}