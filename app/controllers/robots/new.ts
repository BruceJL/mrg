import { action } from '@ember/object';

import { debug } from '@ember/debug';

import { service } from '@ember/service';
import type { Registry as Services } from '@ember/service';
import Controller from '@ember/controller';
import RobotValidation from '../../validations/robot';
import { EmberChangeset } from 'ember-changeset';
import CompetitionModel from 'mrg-sign-in/models/competition';
import type RobotModel from 'mrg-sign-in/models/robot';

export default class RobotNewController extends Controller {
  @service router!: Services['router'];
  @service declare store: Services['store'];
  queryParams = ['competition'];
  RobotValidation = RobotValidation;

  @action
  unload(changeset: EmberChangeset) {
    const robot:RobotModel = changeset.get('data');
    robot.unloadRecord();
    window.history.back();
  }

  @action
  save(changeset: EmberChangeset) {
    changeset.set('paid', 0);
    changeset.set('registered', 'now()');

    const competitionId: CompetitionModel = changeset.get('competition');
    if (competitionId.id === 'RC1') {
      changeset.set('invoiced', '5.00');
    } else {
      changeset.set('invoiced', '20.00');
    }

    const c = this.store.peekRecord('competition', competitionId.id);
    changeset.set('competition', c);

    changeset.save().then(() => {
      const id = changeset.get('id').toString();
      debug('Robot id: ' + id);
      this.router.transitionTo('robots.edit', id);
    });
  }
}
