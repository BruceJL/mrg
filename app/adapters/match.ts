import JSONAPIAdapter from '@ember-data/adapter/json-api';

import {adapterFetch} from 'mrg-sign-in/adapters/tournament';

export default class MatchAdapter extends JSONAPIAdapter {
  namespace = 'api/flask/tournaments';

  query(store: any, type: any, query: any) {
  const { competition, ring } = query;
  let baseUrl = this.buildURL();
  return adapterFetch(`${baseUrl}/${competition}/${ring}/matches`);
  }
}
