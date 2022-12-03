//import { MinimumAdapterInterface } from '@ember-data/adapter';
import Adapter from '@ember-data/adapter';
//import ModelSchema from '@ember-data/model';
import type ModelRegistry from 'ember-data/types/registries/model';

import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import fetch from 'fetch';

import type Store from '@ember-data/store';
import type { Snapshot } from '@ember-data/store';
//import type DS from 'ember-data';

export default class PostgrestAdapter extends Adapter {
    //@service store;
    host = "";
    namespace = "";

    //POST /table_name HTTP/1.1
    //{ "col1": "value1", "col2": "value2" }
    createRecord<K extends keyof ModelRegistry>(
      store: Store,
      type: ModelRegistry[K], //ModelSchema?
      snapshot: Snapshot,
    ): RSVP.Promise<any> {
        let data = JSON.stringify(snapshot.serialize({ includeId: false }));
        let url = this.prefixURL(type.modelName)
        //debugger;
        return fetch(
          url, {
            method: 'post',
            headers: {
              "Content-type": "application/json; charset=utf-8",
              "Prefer": "return=representation",
            },
            body: data,
          }
        );
    }

    // Find all records in a given table.
    // URL looks like this: https://site/robot)
    findAll<K extends keyof ModelRegistry>(
      store: Store,
      type: ModelRegistry[K], //ModelSchema?
    ): RSVP.Promise<any> {
        let url = this.prefixURL(type.modelName);
        //debugger;
        return fetch(
          url, {
            method: 'GET',
            headers: {
              "Accept": "application/json; charset=utf-8",
            }
          });
    }

    /*
    // Find the "owning" record for a given record. The URL works just like a
    // "findMany". The URL looks like this:
    // http://check-in:3000/robotmeasurements?id=eq.424&select=*,robot(*)
    findBelongsTo <K extends keyof ModelRegistry>( // [OPTIONAL]
      store: store,
      snapshot: Snapshot<K>,
      relatedLink: string,
      relationship,
    ): RSVP.Promise<any> {
        let s =
        let url = this.prefixURL(s);
        return fetch(url);
    }
    */

    // Finds entries from a given table for a given list of IDs.
    //URL looks like: http://site/robots?or=(id.eq.1191,id.eq.1192)
    findMany<K extends keyof ModelRegistry> ( // [OPTIONAL]
      store: Store,
      type: ModelRegistry[K],
      ids: Array<String>,
      snapshots: Array<Snapshot>
    ): RSVP.Promise<any> {
      let s = [];
      for (const id of ids) {
          s.push("id.eq." + id);
      }
      let q: string = s.join(",");
      let url = this.prefixURL(type.modelName + '?or=(' + q + ')');
      return fetch(url);
    }

    // Find a specific record
    // URL looks like this: https://site/robots?id=eq.1234)
    findRecord<K extends keyof ModelRegistry>(
      store: Store,
      type: ModelRegistry[K],
      id: string,
      snapshot : Snapshot
    ): RSVP.Promise<any> {
        let url = this.prefixURL(type.modelName + '?id=eq.' + id);
        return fetch(url);
    }

    // Find a record with all associated records from another table.
    // URL looks like this: robots?id=eq.1422&select=*,robotmeasurements(*)
    findhasMany ( // [OPTIONAL]
      store: Store,
      snapshot: Snapshot,
      relatedLink: String,
      relationship: any, //:RelationshipSchema, No way to import this currently.
    ): RSVP.Promise<any> {
        let s = "?id=eq." + snapshot.id + "&select=*," + relatedLink + "(*)";
        let url = this.prefixURL(s)
        return fetch(url);
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
      query: {[key: string]: Object},
      recordArray: any, //: Collection,
      // options: Object, Spec'd in MinimumInterfaceAdapter, but not Adapter?
    ): RSVP.Promise<any>  {
        let url = "";
        let s = [];
        for (let key in query) {
          let value = query[key];
          if (typeof value == "boolean") {
            s.push(key + "=is." + value);
          } else {
            s.push(key  + "=eq." + value);
          }
        }
        url = this.prefixURL(type.modelName + url);
        return fetch(url);
    }

    // UNSURE: I don't know what differentiates a "queryrecord" from a "query"
    // The docs are not too helpful.
    queryRecord<K extends keyof ModelRegistry>(
      store: Store,
      type: ModelRegistry[K],
      query: {[key: string]: Object}, //Dict<unknown>, as per MinimumAdapterInterface
      //options: { adapterOptions?: unknown }, Spec'd in MinimumInterfaceAdapter, but not Adapter?
    ): RSVP.Promise<any> {
        let url = "";
        let s = [];
        for (let key in query) {
          let value = query[key];
          if (typeof value == "boolean") {
            s.push(key + "=is." + value);
          } else {
            s.push(key  + "=eq." + value);
          }
        }
        url = this.prefixURL(type.modelName + url);
        return fetch(url);
    }

    updateRecord<K extends keyof ModelRegistry>(
      store: Store,
      type: ModelRegistry[K],
      snapshot: Snapshot,
    ): RSVP.Promise<any>  {
    //   const data = serializeIntoHash(store, schema, snapshot, {});
    //   const type = snapshot.modelName;
    //   const id = snapshot.id;
    //   assert(`Attempted to update the ${type} record, but the record has no id`, typeof id === 'string' && id.length > 0);
    //   let url = this.buildURL(type, id, snapshot, 'updateRecord');
        let data = JSON.stringify(snapshot.serialize({ includeId: true }));
        let url = this.prefixURL(type.modelName);
        return fetch(
          url, {
            method: 'post',
            headers: {
              "Content-type": "application/json;",
              "Prefer": "return=representation",
            },
            body: data,
          }
        );
    }

    /*
    // Stolen from https://github.com/emberjs/data/blob/v4.7.3/packages/serializer/addon/rest.js#L481
    serialize(snapshot, options) {
      let json = {};
      snapshot.eachAttribute(function(name) {
        json[serverAttributeName(name)] = snapshot.attr(name);
      });
      snapshot.eachRelationship(function(name, relationship) {
        if (relationship.kind === 'hasMany') {
          json[serverHasManyName(name)] = snapshot.hasMany(name, { ids: true });
        }
      });
      if (options.includeId) {
        json.ID_ = snapshot.id;
      }
      return json;
    }
    */

    prefixURL(modelName: string){
        let url = [];
        let { host } = this;
        let prefix = this._urlPrefix();
        url.push(modelName);
        if (prefix) {
            url.unshift(prefix);
        }
        let urlString = url.join('/');
        if (!host && urlString && urlString.charAt(0) !== '/') {
            urlString = '/' + urlString;
        }
        return urlString;
    }

    // stolen from packages/adapter/addon/-private/build-url-mixin.ts
    _urlPrefix(
      path?: string | null,
      parentURL?: string,
    ): Array<string> {
        let { host, namespace } = this;
        let url: Array<string> = [];

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
                url.push(`${parentURL}/${path}`)
            }
            return url
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