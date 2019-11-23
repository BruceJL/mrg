import Component from '@ember/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { debug } from '@ember/debug';

export default class RobotDetailController extends Component {
    @tracked changeset;

    @action
    updateCompetition(event) {
        const id = event.target.value;
        debug('running updateCompetition for id: ' + id);
        const c = this.competitions.findBy('id', id);
        debug('found competition: ' + c);
        this.changeset.set('competition', c);
    }
}
