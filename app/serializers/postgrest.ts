// // import RESTSerializer from '@ember-data/serializer/rest';
import type ModelRegistry from 'ember-data/types/registries/model';
import type Model from '@ember-data/model';
import type Store from '@ember-data/store';
import JSONSerializer from '@ember-data/serializer/json';
import { Snapshot } from '@ember-data/store';
import { singularize } from 'ember-inflector';


type ModelClass = Model & {
    modelName: keyof ModelRegistry;
};

type RelationshipValue = string | { id: string } | { id: string }[] | null;

// Lots of stuff stolen from:
// https://github.com/knownasilya/ember-supabase/blob/main/addon/serializers/supabase.ts

export default class ApplicationSerializer extends JSONSerializer {

    //Overrideing the serializeAttibute so that only dirty data is written
    //Back to the database. snippet stolen from:
    //https://emberigniter.com/saving-only-dirty-attributes/

    // serializeAttribute(
    //   snapshot,
    //   json,
    //   key,
    //   attributes
    // ) {
    //     if (snapshot.record.get('isNew') || snapshot.changedAttributes()[key]) {
    //         super.serializeAttribute(...arguments);
    //     }
    // }

    private appendIncludedRecordsToPayload(
      primaryModelClass: ModelClass,
      payload: Record<string, Record<string, any> | Record<string, unknown>[]>,
      record: Record<string, unknown>,
    ): void {
        primaryModelClass.eachRelationship((name_plural, { kind, type }) => {
          let name = singularize(name_plural);
          const value = record[name] as RelationshipValue;
          if (value && typeof value === 'object') {
            if (!Array.isArray(payload[type])) {
              payload[type] = [];
            }

            if (kind === 'belongsTo' && !Array.isArray(value)) {
                payload[type]?.push(value);
                record[name] = value.id;
            } else if (kind === 'hasMany' && Array.isArray(value)) {
              payload[type]?.push(...value);
              record[name] = value.map((record) => record.id);
            }
          }
        });
    }

    public normalizeSingleResponse(
      store: Store,
      primaryModelClass: ModelClass,
      payload: Record<string, Record<string, unknown>>,
      id: string,
      requestType: string
    ): Record<string, unknown> {
        debugger;
        const record = payload[0];
        if(record){
            this.appendIncludedRecordsToPayload(primaryModelClass, payload, record);
        }

        return super.normalizeSingleResponse(
          store,
          primaryModelClass,
          payload,
          id,
          requestType
        );
    }

    public normalizeArrayResponse(
      store: Store,
      primaryModelClass: ModelClass,
      payload: Record<string, []>,
      id: string,
      requestType: string
    ): Record<string, unknown> {
        debugger;
        const records = payload[primaryModelClass.modelName];
        if(records){
          records.forEach((record) => {
              this.appendIncludedRecordsToPayload(primaryModelClass, payload, record);
          });
        }

        return super.normalizeArrayResponse(
            store,
            primaryModelClass,
            payload,
            id,
            requestType
        );
    }

    serialize(
      snapshot: Snapshot,
      options: [string],
    ): Object {
        let json = {
          id: snapshot.id
        };
        debugger;
        return super.serialize(snapshot, options);
    }
}
