import { action } from '@ember/object';
import RefreshedController from '../../RefreshedController';
import { tracked } from '@glimmer/tracking';



export default class CompetitionsTournamentRankController extends RefreshedController {

  @tracked ranking = [];

  @action
  async loadRanking(competitionId:string, ringNumber:number){

    console.log(`Fetching ranking for competition ${competitionId} and ring ${ringNumber}`);
    const response = await fetch(`/api/flask/tournaments/${competitionId}/${ringNumber}/rank`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.ranking = await response.json();
  }
}
