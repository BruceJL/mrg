import MinimumSerializerInterface from 'ember-data/serializer';
import type ModelRegistry from 'ember-data/types/registries/model';
import type Model from '@ember-data/model';
import type Store from '@ember-data/store';
import { Snapshot } from '@ember-data/store';
import { isArray } from '@ember/array';

type ModelClass = Model & {
    modelName: keyof ModelRegistry;
};
// Some of this stuff stolen from:
// https://github.com/knownasilya/ember-supabase/blob/main/addon/serializers/supabase.ts

export default class PostgresSerializer extends MinimumSerializerInterface {

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

    private parseIncludedRecord(
      data: Record<string, any>,
      thisType: string,
      parentType: string,
      entry: Record<string, any>,
      included: Record<string, any>[],
    ): void {
      let o = this.parseRecord(entry, thisType, parentType);

      // Since we're not at the top level, any data returned needs
      // to go onto the included array, as it's not the *primary* data.
      // Note that we cannot use Array.concat here has it makes a new
      // array object which is not passed back to the calling function.
      if(o['data']['id'] !== undefined){
        included.push(o['data']);

        // Because we are not at the top level of the JSON:API document
        // push the return relationshuip to the relationships element.
        data['relationships'][thisType]['data'].push(o['relationshipData']);
      }
    }

    private parseRecord(
      payload: Record<string, any>,
      thisType: string,
      parentType: string,
      //type: string,
    ): Record<string, any> {
      let included: Record<string, any>[] = []
      let relationshipData: Record<string, any> = {};
      let data: Record<string, any> = {};

      data['id'] = payload['id'];
      data['type'] = thisType;
      data['attributes'] = {};
      data['relationships'] = {};
      relationshipData = {'type': thisType, 'id': payload['id']};


      for(const key in payload){
        if (
             (Array.isArray(payload[key])
          || typeof payload[key] === 'object')
          && payload[key] !== null
        ){
          // This is an array of objects.
          // It will need to be captured as a 'included' and 'relationships'.
          // information.
          data['relationships'][key] = {};
          data['relationships'][key]['data'] = [];

          // Deal with an array of items
          if(Array.isArray(payload[key])){
            payload[key].forEach((entry: Record<string, any>) =>{
              this.parseIncludedRecord(data, key, thisType, entry, included);
            });
          } else if(typeof payload[key] === 'object'){
            // Deal with a singular item.
            this.parseIncludedRecord(data, key, thisType, payload[key], included);
          }

          // Deal with the relationships returned value.
          if(data['relationships'][key]['data'].length === 0){
            // delete it if there's nothing in there.
            delete(data['relationships'][key]);

          }else if(data['relationships'][key]['data'].length === 1){
            // make data['relationships'][key]['data'] a single object if the
            //array length is 1.
            data['relationships'][key]['data'] = data['relationships'][key]['data'][0];
          }

        } else if(key !== 'id' && key !== thisType && key !== parentType) {
            // Just a regular attribute. Populate the 'attributes' element.
          data['attributes'][key] = payload[key];
        }
      }

      // tidy up the relationships array.
      if( Object.keys(data['relationships']).length === 0){
        delete(data['relationships']);
      }

      const return_data = {
        'data': data,
        'included': included,
        'relationshipData': relationshipData,
      }

      return return_data;
    }

    private reformatPayload(
      primaryModelClass: ModelClass,
      payload: Record<string, Record<string, any> | Record<string, unknown>[]>[],
      requestType: string,
    ): Record<string, any> {
      //debugger;
      let data: any = [];
      let included: Record<string, Record<string, any> | Record<string, unknown>[]>[] = [];

      // this populates the top level of the JSON:API responce, which does
      // not have a 'relationships' key.
      payload.forEach((item: Record<string, any>) => {
        let o =
          this.parseRecord(
            item,
            primaryModelClass.modelName.toString(), // thisType,
            "", // parentType
          );
        // push the gathered item into the 'data' array.
        data.push(o['data']);

        //merge included and o['included'] removing any duplicates.
        o['included'].forEach((a: Record<string, any>) => {
          let found = false;

          included.every((b: Record<string, any>) => {
            if(a['id'] === b['id'] && a['type'] === b['type']){
              found = true;
              return false;
            } else {
              return true;
            }
          });

          // The item was not located, add it to included.
          if(!found){
            included.push(a)
          }
        });

        // Ignore relationships as that is only to be included within
        // specific items.
      });

      // Start building the final object to return.
      let payload_rtn: any = {};

      // populate the mandatory 'meta' field.
      payload_rtn['meta'] = {};

      // populate the 'data' field.
      if(requestType === "findRecord" || data.length === 1){
        payload_rtn['data'] = data[0];
      }else{
        payload_rtn['data'] = data;
      }

      // only include the 'included' key if there is at least one item.
      if(included.length === 1){
        payload_rtn['included'] = included[0];
      }else if(included.length > 1){
        payload_rtn['included'] = included;
      }
      //debugger;
      return payload_rtn;
    }

    public normalizeResponse(
      store: Store,
      primaryModelClass: ModelClass,
      payload: any,
      id: string,
      requestType: string,
    ): Object {
      return this.reformatPayload(primaryModelClass, payload, requestType);
    }

    serialize(
      snapshot: Snapshot,
      options: [string],
    ): Object {
        let json = {
          id: snapshot.id
        };
        debugger;
        return JSON.stringify(snapshot);
    }
}