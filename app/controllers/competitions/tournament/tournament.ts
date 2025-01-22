import type MatchModel from 'mrg-sign-in/models/match';
import RefreshedController from '../../RefreshedController';
import type { ModelFrom } from '../../../routes/competitions/tournament/tournament';
import type CompetitionsTournamentRoute from '../../../routes/competitions/tournament/tournament';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';


export default class TournamentController extends RefreshedController {
  declare model: ModelFrom<CompetitionsTournamentRoute>;

  @tracked judge = this.model.judge;

  get sortedMatches(): Array<MatchModel> {
    return this.model.matches
    .slice()
    .sort((a, b) => (Number(a.id) - Number(b.id)));
  }

  @action
  updateJudge(event: Event): void {
    if (event.target) {
      this.judge = (event.target as HTMLInputElement).value;
    }
  }

  @action
  saveJudge(): void {
    this.model.judge = this.judge;
    this.model.save();
  }
}
