import Service from '@ember/service';
import type MatchModel from 'mrg-sign-in/models/match';

export default class RoundRobinService extends Service {

  slotCheckedInEntries(competitionId: string, numberRings: number): Promise<Response> {
    const body = { competition: competitionId, number_rings: numberRings };
    return postRequest('/api/flask/slot-checked-in-entries', body);
  }

  resetRingAssignments(competitionId: string): Promise<Response> {
    const body = { competition: competitionId };
    return postRequest('/api/flask/reset-ring-assignments', body);
  }

  assignJudge(competitionId: string, ringNumber: number, judgeName: string): Promise<Response> {
    const body = { competition: competitionId, ring: ringNumber, judge: judgeName };
    return postRequest('/api/flask/assign-judge', body);
  }

  async getJudges(competitionId: string): Promise<string[]> {
    const body = { competition: competitionId };
    const res = await postRequest('/api/flask/get-judges', body);
    return res.json();
  }

  async setStartTime(competitionId: string, ringNumber: number, startTime: string): Promise<Response> {
    const body = { competition: competitionId, ring: ringNumber, start_time: startTime };
    return postRequest(`/api/flask/tournaments/${competitionId}/${ringNumber}/start-time`, body);
  }

  async getStartTime(competitionId: string, ringNumber: number): Promise<string> {
    const url = `/api/flask/tournaments/${competitionId}/${ringNumber}/start-time`;
    const res = await getRequest(url,{});
    return res.json();
  }

  async resetStartTime(competitionId: string, ringNumber: number): Promise<Response> {
    return deleteRequest(`/api/flask/tournaments/${competitionId}/${ringNumber}/start-time`, {});
  }

  async updateMatch(match:MatchModel): Promise<Response> {
    // api route: "/<string:competition>/<int:ring>/matches/<int:match>"
    // match id format: competitionId-ringNumber-matchNumber
    const [competitionId, ringNumber, matchNumber] = match.id.split('-');
    const body = {
      competition: competitionId,
      ring: ringNumber,
      match: matchNumber,
      round1winner: match.round1winner,
      round2winner: match.round2winner,
    };
    return putRequest(`/api/flask/tournaments/${competitionId}/${ringNumber}/matches/${matchNumber}`, body);
  }
}

async function postRequest(url: string, body: object): Promise<Response> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return response;
}

async function getRequest(url: string, body:object): Promise<Response> {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return response;
}
async function putRequest(url: string, body: object): Promise<Response> {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return response;
}

async function deleteRequest(url: string, body: object): Promise<Response> {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return response;
}


// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:round-robin')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('round-robin') declare altName: RoundRobinService;`.
declare module '@ember/service' {
  interface Registry {
    'round-robin': RoundRobinService;
  }
}
