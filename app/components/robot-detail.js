import Component from '@ember/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { debug } from '@ember/debug';

export default class RobotDetailController extends Component {
    @tracked changeset;

    @action
    updateCompetition(event) {
        const id = event.target.value;
        const c = this.competitions.findBy('id', id);
        this.changeset.set('competition', c);
    }

    @action
    save(changeset) {
      changeset.save();
    }
    
    @action
    rollback(changeset) {
      changeset.rollback();
    }
}
