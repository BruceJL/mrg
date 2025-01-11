import Route from '@ember/routing/route';
import type CompetitionsTournamentRankController from 'mrg-sign-in/controllers/competitions/tournament/rank';
import type Transition from '@ember/routing/transition';

type Model = {
  competition_id: string;
  ring_number: number;
}

export default class CompetitionsTournamentRankRoute extends Route {
  model(params:any): Model {
    return {
      competition_id: params.competition_id,
      ring_number: params.ring_number,
    };
  }

  setupController(controller:CompetitionsTournamentRankController, model: Model, transition:Transition): void {
    super.setupController(controller, model, transition);
    controller.loadRanking(model.competition_id, model.ring_number);
  }
}
