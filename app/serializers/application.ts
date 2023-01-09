// // import RESTSerializer from '@ember-data/serializer/rest';
import type ModelRegistry from 'ember-data/types/registries/model';
import type Model from '@ember-data/model';
import type Store from '@ember-data/store';
import JSONAPISerializer from '@ember-data/serializer/json-api';
import { Snapshot } from '@ember-data/store';

type ModelClass = Model & {
    modelName: keyof ModelRegistry;
};
// Lots of stuff stolen from:
// https://github.com/knownasilya/ember-supabase/blob/main/addon/serializers/supabase.ts

export default class PostgresSerializer extends JSONAPISerializer {

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

    private getIncludedData(
      data: Record<string, any>[],
      modelClass: string,
      included: Record<string, Record<string, any> | Record<string, unknown>[]>[],
      relationships: Record<string, Record<string, any> | Record<string, unknown>[]>,
    ): void {
      let item = {};
      relationships['data'] = {};
      data.forEach((data: Record<string, any>) => {
        // 'item' to be added to the 'included' array.
        let item: Record<string, any | Record<string, unknown>> = {};
        item['id'] = data['id'];
        item['type'] = modelClass;
        item['attributes'] = {};
        if(relationships['data'] === undefined){
          throw new Error("relationships[data] is undefined.");
        }
        relationships['data'].push({"type": modelClass, "id": data['id']});
        for(const key in item){
          if(key !== 'id') {
            item['attributes'][key] = item[key];
          }
        }
        included.push(item);
      });
    }

    private reformatPayload(
      primaryModelClass: ModelClass,
      payload: Record<string, Record<string, any> | Record<string, unknown>[]>[],
    ): {} {
      let newPayload: Record<string, Record<string, any> | Record<string, unknown>[]> = {};
      newPayload['data'] = [];
      newPayload['errors'] = [];
      newPayload['meta'] = []
      let included: Record<string, Record<string, any> | Record<string, unknown>[]>[] = [];
      let relationships: Record<string, Record<string, any> | Record<string, unknown>[]> = {};
      if(payload === undefined){
        throw new Error("Payload is undefined.");
      }else{
        payload.forEach((item: Record<string, any>) => {
          let newitem: Record<string, any> = {};
          newitem['id'] = item['id'];
          newitem['type'] = primaryModelClass;
          newitem['attributes'] = {};
          //debugger;
          for(const key in item){
            let data: Record<string, any> | Record<string, unknown>[] = item[key];
            if(Array.isArray(data)){
              this.getIncludedData(data, key, included, relationships)

            } else if(key !== 'id') {
              newitem['attributes'][key] = data;
            }
          }
          if(Object.keys(relationships).length > 0){
            newitem['relationships'] = relationships;
          }
          newPayload['data']?.push(newitem);
        });
      }
      if(included.length > 0){
        newPayload['included'] = included;
      }
      debugger;
      return newPayload;
    }

    public normalizeResponse(
      store: Store,
      primaryModelClass: ModelClass,
      payload: any,
      //payload: Record<string, Record<string, unknown>>[],
      id: string,
      requestType: string,
    ): Object {
      payload = this.reformatPayload(primaryModelClass, payload);
      return super.normalizeResponse(store, primaryModelClass, payload, id, requestType);
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
