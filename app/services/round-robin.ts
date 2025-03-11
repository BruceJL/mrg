import Service from '@ember/service';
import { service } from '@ember/service';
import type { Registry as Services } from '@ember/service';

export default class RoundRobinService extends Service {
  @service declare store: Services['store'];

  slotCheckedInEntries(competitionId: string, numberRings: number): Promise<Response> {
    const body = { competition: competitionId, number_rings: numberRings };
    return postRequest('/api/flask/slot-checked-in-entries', body);
  }

  resetRingAssignment(competitionId: string): Promise<Response> {
    const body = { competition: competitionId };
    return postRequest('/api/flask/reset-ring-assignments', body);
  }

  getRanking(tournamentId: string): Promise<Response> {
    return getRequest(`/api/rpc/get_tournament_winners?tournament_id=${tournamentId}`);
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

async function getRequest(url: string): Promise<Response> {
  const response = await fetch(url);
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
