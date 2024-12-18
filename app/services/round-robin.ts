import Service from '@ember/service';

export default class RoundRobinService extends Service {
  async slotCheckedInEntries(competitionId:number, numberRings:number
  ) {
    const response = await fetch('/api/flask/slot-checked-in-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ competition: competitionId, number_rings: numberRings }),
    });

    return response.ok;
  }

  async resetRingAssignments(competitionId:number) {
    const response = await fetch('/api/flask/reset-ring-assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ competition: competitionId }),
    });

    return response.ok;
  }
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
