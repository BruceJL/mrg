//import { MinimumAdapterInterface } from '@ember-data/adapter';
import MinimumInterfaceAdapter from '@ember-data/adapter';
//import ModelSchema from '@ember-data/model';
import type ModelRegistry from 'ember-data/types/registries/model';

//import { inject as service } from '@ember/service';
import RSVP, { reject } from 'rsvp';
import fetch from 'fetch';

import type Store from '@ember-data/store';
import type { Snapshot } from '@ember-data/store';
import ENV from 'mrg-sign-in/config/environment';

import {
  isAbortError,
  isServerErrorResponse,
  isUnauthorizedResponse,
} from 'ember-fetch/errors';

export default class PostgrestAdapter extends MinimumInterfaceAdapter {
  namespace = ENV.APP.API_NAMESPACE;
  host = ENV.APP.API_HOST;

  _fetch(
    input: URL | RequestInfo,
    init?: RequestInit | undefined,
  ): RSVP.Promise<Response> {
    return fetch(
      input,
      init,
      // The following stolen from: https://github.com/ember-cli/ember-fetch
    )
      .then(function (response: Response) {
        if (response.ok) {
          return response.json();
        } else if (isUnauthorizedResponse(response)) {
          // handle 401 response
          reject(response);
        } else if (isServerErrorResponse(response)) {
          // handle 5xx respones
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

  private makeQueryString(
    id: string | undefined,
    includes: string | undefined,
  ): string {
    if (includes === undefined && id === undefined) {
      return '';
    }
    let s = '?';

    if (id !== undefined) {
      s = s + 'id=eq.' + id;
    }

    if (includes !== undefined) {
      if (s !== '?') {
        s = s + '&';
      }

      const a = includes.split(',');
      s = s + 'select=*';
      a.forEach((element: string) => {
        s = s + ',' + element + '(*)';
      });
    }
    return s;
  }

  //POST /table_name HTTP/1.1
  //{ "col1": "value1", "col2": "value2" }
  createRecord<K extends keyof ModelRegistry>(
    store: Store,
    type: ModelRegistry[K], //ModelSchema?
    snapshot: Snapshot,
  ): RSVP.Promise<any> {
    const data = snapshot.serialize({ includeId: false });
    const body = JSON.stringify(data);
    const url = this.prefixURL(type.modelName);
    return this._fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        Prefer: 'return=representation',
      },
      body: body,
    });
  }

  // Find all records in a given table.
  // URL looks like this: https://site/robot)
  findAll<K extends keyof ModelRegistry>(
    store: Store,
    type: ModelRegistry[K], //ModelSchema?
    sinceToken: any,
    snapshot: any,
  ): RSVP.Promise<any> {
    let url = this.prefixURL(type.modelName);
    url = url + this.makeQueryString(undefined, snapshot.include);
    return this._fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json; charset=utf-8',
      },
    });
  }

  // Find a record with all associated records from another table.
  // URL looks like this: robots?id=eq.1422&select=*,robotmeasurements(*)
  findHasMany(
    // [OPTIONAL]
    store: Store,
    snapshot: Snapshot,
    relatedLink: string,
    relationship: any, //FIXME :RelationshipSchema, No way to import this currently.
  ): RSVP.Promise<any> {
    const s = snapshot.modelName + this.makeQueryString(undefined, relatedLink);
    const url = this.prefixURL(s);
    return this._fetch(url);
  }

  // Find the "owning" record for a given record. The URL works just like a
  // "findMany". The URL looks like this:
  // http://site/robotmeasurements?id=eq.424&select=*,robot(*)
  findBelongsTo<K extends keyof ModelRegistry>( // [OPTIONAL]
    store: Store,
    snapshot: Snapshot<K>,
    relatedLink: string,
    relationship: any, //:RelationshipSchema.
  ): RSVP.Promise<any> {
    const s = '?id=eq.' + snapshot.id + '&select=*,' + relatedLink + '(*)';
    const url = this.prefixURL(s);
    return this._fetch(url);
  }

  // Finds entries from a given table for a given list of IDs.
  // URL looks like: http://site/robots?or=(id.eq.1191,id.eq.1192)
  findMany<K extends keyof ModelRegistry>( // [OPTIONAL]
    store: Store,
    type: ModelRegistry[K],
    ids: Array<string>,
    snapshots: Array<Snapshot>,
  ): RSVP.Promise<any> {
    const s = [];
    for (const id of ids) {
      s.push('id.eq.' + id);
    }
    const q: string = s.join(',');
    const url = this.prefixURL(type.modelName + '?or=(' + q + ')');
    return this._fetch(url);
  }

  // Find a specific record
  // URL looks like this: https://site/robots?id=eq.1234)
  findRecord<K extends keyof ModelRegistry>(
    store: Store,
    type: ModelRegistry[K],
    id: string,
    snapshot: any, // FIXME: Snapshot - but I cannot access include because?
  ): RSVP.Promise<any> {
    const includes: 'string' | undefined = snapshot.include;
    const s = type.modelName + this.makeQueryString(id, includes);
    const url = this.prefixURL(s);
    return this._fetch(url);
  }

  /* Don't need generateIdForRecordStore as Postgrest will be taking care of
      that.
  generateIdForRecord(store, type, properties) { //[OPTIONAL]

  }
  */

  // Run a query on a given table.
  // url looks like this: people?age=gte.18&student=is.true
  query<K extends keyof ModelRegistry>(
    store: Store,
    type: ModelRegistry[K],
    query: { [key: string]: Object },
    recordArray: any, //: Collection,
    // options: Object, Spec'd in MinimumInterfaceAdapter, but not Adapter?
  ): RSVP.Promise<any> {
    let url = '';
    const s = [];
    for (const key in query) {
      const value = query[key];
      if (typeof value == 'boolean') {
        s.push(key + '=is.' + value);
      } else {
        s.push(key + '=eq.' + value);
      }
    }
    url = this.prefixURL(type.modelName + url);
    return this._fetch(url);
  }

  // UNSURE: I don't know what differentiates a "queryrecord" from a "query"
  // The docs are not too helpful.
  queryRecord<K extends keyof ModelRegistry>(
    store: Store,
    type: ModelRegistry[K],
    query: { [key: string]: Object }, //Dict<unknown>, as per MinimumAdapterInterface
    //options: { adapterOptions?: unknown }, Spec'd in MinimumInterfaceAdapter, but not Adapter?
  ): RSVP.Promise<any> {
    let url = '';
    const s = [];
    for (const key in query) {
      const value = query[key];
      if (typeof value == 'boolean') {
        s.push(key + '=is.' + value);
      } else {
        s.push(key + '=eq.' + value);
      }
    }
    url = this.prefixURL(type.modelName + url);
    return this._fetch(url);
  }

  updateRecord<K extends keyof ModelRegistry>(
    store: Store,
    type: ModelRegistry[K],
    snapshot: Snapshot,
  ): RSVP.Promise<any> {
    const data = JSON.stringify(snapshot.serialize({ includeId: false }));
    let s = type.modelName + '?id=eq.' + snapshot.id;
    s = this.prefixURL(s);
    return this._fetch(s, {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json;',
        Prefer: 'return=representation',
      },
      body: data,
    });
  }

  prefixURL(modelName: string) {
    const url: Array<string> = [];
    const host = this.host;

    const prefix = this._urlPrefix();
    if (prefix) {
      url.push(...prefix);
    }
    url.push(modelName);
    let urlString = url.join('/');
    if (!host && urlString && urlString.charAt(0) !== '/') {
      urlString = '/' + urlString;
    }
    return urlString;
  }

  // stolen from packages/adapter/addon/-private/build-url-mixin.ts
  _urlPrefix(path?: string | null, parentURL?: string): Array<string> {
    let host = this.host;
    const namespace = this.namespace;
    const url: Array<string> = [];

    if (!host || host === '/') {
      host = '';
    }

    if (path) {
      // Protocol relative url
      if (/^\/\//.test(path) || /http(s)?:\/\//.test(path)) {
        // Do nothing, the full host is already included.
        url.push(path);
      } else if (path.charAt(0) === '/') {
        // Absolute path
        url.push(`${host}${path}`);
      } else {
        // Relative path
        url.push(`${parentURL}/${path}`);
      }
      return url;
    }

    // No path provided
    if (host) {
      url.push(host);
    }
    if (namespace) {
      url.push(namespace);
    }
    return url;
  }
}
