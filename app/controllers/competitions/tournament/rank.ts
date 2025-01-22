import RefreshedController from '../../RefreshedController';
import CompetitionsTournamentRankRoute from '../../../routes/competitions/tournament/rank';
import type { ModelFrom } from '../../../routes/competitions/tournament/rank';

type Ranking = {
  competitor_id: number,
  wins: number
}

export default class CompetitionsTournamentRankController extends RefreshedController {
  declare model: ModelFrom<CompetitionsTournamentRankRoute>;

  get sortedRanking(): Array<Ranking> {
    const res = this.model.ranking
    .slice()
    .sort((a:Ranking, b:Ranking) => (b.wins - a.wins));
    return res;
  }
}
