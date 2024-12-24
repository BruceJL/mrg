import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import type { Registry as Services } from '@ember/service';
import { service } from '@ember/service';
// import MatchRobotComponent from './match-robot';
import robotModel from '../models/robot';
import { on } from '@ember/modifier';
import { fn} from '@ember/helper';
import eq from '../helpers/eq';
import RoundRobinService from '../services/round-robin';


export default class MatchComponent extends Component {
  @service declare store: Services['store'];
  @service('round-robin') declare rrService: RoundRobinService;

  @tracked robot1:robotModel = null;
  @tracked robot2:robotModel = null;

  constructor(owner, args) {
    super(owner, args);

    this.setUpMatch(args.match);
  }

  async loadRobots(robot1Id, robot2Id) {
    try {
      // Fetch both robots asynchronously
      const robot1 = await this.store.findRecord('robot', robot1Id);
      const robot2 = await this.store.findRecord('robot', robot2Id);

      // Update the tracked properties with the resolved data
      this.robot1 = robot1;
      this.robot2 = robot2;
    } catch (error) {
      console.error('Error loading robots:', error);
    }
  }

  setUpMatch(match) {
    this.loadRobots(match.contestant1, match.contestant2);
  }

  @action
  updateMatchWinner(match, round, winner) {
    if (round === 1) {
      match.round1winner = winner;
      this.rrService.updateMatch(match);
    } else if (round === 2) {
      match.round2winner = winner;
      this.rrService.updateMatch(match);
    }
  }

  <template>
  <div>
    <div>
      <h4>Match: {{@match.id}}</h4>
      <table>
        <thead>
        </thead>
        <tbody>
          <tr>
            <td>
              Round 1
            </td>
            <td>
              <label>
                <input type="radio" name="{{@match.id}}_round1" value="1" {{on "change" (fn this.updateMatchWinner @match 1 1)}} checked={{eq @match.round1winner 1}}/> {{this.robot1.name}}
              </label>
              <label>
                <input type="radio" name="{{@match.id}}_round1" value="2" {{on "change" (fn this.updateMatchWinner @match 1 2)}} checked={{eq @match.round1winner 2}}/> {{this.robot2.name}}
              </label>
              <label>
                <input type="radio" name="{{@match.id}}_round1" value="0" {{on "change" (fn this.updateMatchWinner @match 1 0)}} checked={{eq @match.round1winner 0}}/> None
              </label>
            </td>
          </tr>
          <tr>
            <td>
              Round 2
            </td>
            <td>
              <label>
                <input type="radio" name="{{@match.id}}_round2" value="1" {{on "change" (fn this.updateMatchWinner @match 2 1)}} checked={{eq @match.round2winner 1}}/> {{this.robot1.name}}
              </label>
              <label>
                <input type="radio" name="{{@match.id}}_round2" value="2" {{on "change" (fn this.updateMatchWinner @match 2 2)}} checked={{eq @match.round2winner 2}}/> {{this.robot2.name}}
              </label>
              <label>
                <input type="radio" name="{{@match.id}}_round2" value="0" {{on "change" (fn this.updateMatchWinner @match 2 0)}} checked={{eq @match.round2winner 0}}/> None
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  </template>
}


