import Component from '@glimmer/component';
import { action } from '@ember/object';
import type { Registry as Services } from '@ember/service';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import { fn} from '@ember/helper';
import eq from '../helpers/eq';
import MatchModel from '../models/match';


export default class MatchComponent extends Component {
  @service declare store: Services['store'];

  @action
  updateMatchWinner(match:MatchModel, round:number, winner:number) {
    if (round === 1) {
      match.round1winner = winner;
    } else if (round === 2) {
      match.round2winner = winner;
    } else if (round === 3) {
      match.round3winner = winner;
    }

    match.save();
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
                <input type="radio" name="{{@match.id}}_round1" value="1" {{on "change" (fn this.updateMatchWinner @match 1 1)}} checked={{eq @match.round1winner 1}}/> {{@match.competitor1.name}}
              </label>
              <label>
                <input type="radio" name="{{@match.id}}_round1" value="2" {{on "change" (fn this.updateMatchWinner @match 1 2)}} checked={{eq @match.round1winner 2}}/> {{@match.competitor2.name}}
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
                <input type="radio" name="{{@match.id}}_round2" value="1" {{on "change" (fn this.updateMatchWinner @match 2 1)}} checked={{eq @match.round2winner 1}}/> {{@match.competitor1.name}}
              </label>
              <label>
                <input type="radio" name="{{@match.id}}_round2" value="2" {{on "change" (fn this.updateMatchWinner @match 2 2)}} checked={{eq @match.round2winner 2}}/> {{@match.competitor2.name}}
              </label>
              <label>
                <input type="radio" name="{{@match.id}}_round2" value="0" {{on "change" (fn this.updateMatchWinner @match 2 0)}} checked={{eq @match.round2winner 0}}/> None
              </label>
            </td>
          </tr>
           <tr>
            <td>
              Round 3
            </td>
            <td>
              <label>
                <input type="radio" name="{{@match.id}}_round3" value="1" {{on "change" (fn this.updateMatchWinner @match 3 1)}} checked={{eq @match.round3winner 1}}/> {{@match.competitor1.name}}
              </label>
              <label>
                <input type="radio" name="{{@match.id}}_round3" value="2" {{on "change" (fn this.updateMatchWinner @match 3 2)}} checked={{eq @match.round3winner 2}}/> {{@match.competitor2.name}}
              </label>
              <label>
                <input type="radio" name="{{@match.id}}_round3" value="0" {{on "change" (fn this.updateMatchWinner @match 3 0)}} checked={{eq @match.round3winner 0}}/> None
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  </template>
}


