import JSONAPIAdapter from '@ember-data/adapter/json-api';
import fetch from 'fetch';
import RSVP, { reject } from 'rsvp';
import {
  isAbortError,
  isServerErrorResponse,
  isUnauthorizedResponse,
  isNotFoundResponse,
} from 'ember-fetch/errors';

// Export the afetch function
export function adapterFetch(input: URL | RequestInfo, init?: RequestInit | undefined): RSVP.Promise<Response> {
  return fetch(input, init)
    .then(function (response: Response) {
      if (response.ok) {
        return response.json();
      } else if (isUnauthorizedResponse(response)) {
        // handle 401 response
        reject(response);
      } else if (isServerErrorResponse(response)) {
        // handle 5xx responses
        reject(response);
      } else if (isNotFoundResponse(response)) {
        reject(response);
      }
    })
    .catch(function (error: Error) {
      if (isAbortError(error)) {
        // handle aborted network error
        reject(error);
      }
      // handle network error
    });
}

export default class TournamentAdapter extends JSONAPIAdapter {
  namespace = 'api/flask/tournaments';

  queryRecord(store: any, type: any, query: any) {
  const { competition, ring } = query;
  let baseUrl = this.buildURL();
  return adapterFetch(`${baseUrl}/${competition}/${ring}`);

  }
}
