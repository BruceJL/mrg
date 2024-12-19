import Service from '@ember/service';

export default class RoundRobinService extends Service {

  async slotCheckedInEntries(competitionId: string, numberRings: number): Promise<Response> {
    const body = { competition: competitionId, number_rings: numberRings };
    return await postRequest('/api/flask/slot-checked-in-entries', body);
  }

  async resetRingAssignments(competitionId: string): Promise<Response> {
    const body = { competition: competitionId };
    return postRequest('/api/flask/reset-ring-assignments', body);
  }

  async assignJudge(competitionId: string, ringNumber: number, judgeName: string): Promise<Response> {
    const body = { competition: competitionId, ring: ringNumber, judge: judgeName };
    console.log(body);
    return postRequest('/api/flask/assign-judge', body);
  }

  async getJudges(competitionId: string): Promise<string[]> {
    const body = { competition: competitionId };
    const success = await postRequest('/api/flask/get-judges', body);
    const res = await success.json();
    return res;
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


// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:round-robin')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('round-robin') declare altName: RoundRobinService;`.
declare module '@ember/service' {
  interface Registry {
    'round-robin': RoundRobinService;
  }
}
