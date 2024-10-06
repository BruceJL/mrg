import MinimumSerializerInterface from '@ember-data/serializer';
import Store from '@ember-data/store';
import { Snapshot } from '@ember-data/store';
import { ModelSchema } from '@ember-data';
import { service } from '@ember/service';

export default class PostgresSerializer extends MinimumSerializerInterface {
  @service declare store: Store;

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
    const model = this.store.modelFor(thisType);
    const o = this.parseRecord(entry, thisType, parentType, model);

    // Since we're not at the top level, any data returned needs
    // to go onto the included array, as it's not the *primary* data.
    // Note that we cannot use Array.concat here has it makes a new
    // array object which is not passed back to the calling function.
    if (o['data']['id'] !== undefined) {
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
    model: ModelSchema,
  ): Record<string, any> {
    const included: Record<string, any>[] = [];
    let relationshipData: Record<string, any> = {};
    const data: Record<string, any> = {};
    const resourceHash: Record<string, string> = {};
    const parentHash: Record<string, ModelSchema> = {};

    data['id'] = payload['id'].toString();
    data['type'] = thisType;
    data['attributes'] = {};
    data['relationships'] = {};
    relationshipData = { type: thisType, id: payload['id'] };

    model.eachRelationship((name, descriptor) => {
      resourceHash[name] = descriptor.kind;
    });

    for (const key in payload) {
      if (
        (Array.isArray(payload[key]) || typeof payload[key] === 'object') &&
        payload[key] !== null
      ) {
        // This is an array of objects.
        // It will need to be captured as a 'included' and 'relationships'.
        // information.
        data['relationships'][key] = {};
        data['relationships'][key]['data'] = [];

        if (Array.isArray(payload[key])) {
          // Deal with an array of items. This will be a hasMany relationship.
          payload[key].forEach((entry: Record<string, any>) => {
            this.parseIncludedRecord(data, key, thisType, entry, included);
          });
        } else if (typeof payload[key] === 'object') {
          // Deal with a singular item. Will be a belongsTo relationship.
          this.parseIncludedRecord(data, key, thisType, payload[key], included);
          // Make it a single Object as this is a belongsTo relationship.
          data['relationships'][key]['data'] =
            data['relationships'][key]['data'][0];
        }

        // Deal with the relationships returned value.
        if (Array.isArray(data['relationships'][key]['data'])) {
          if (data['relationships'][key]['data'].length === 0) {
            // delete it if there's nothing in there.
            delete data['relationships'][key];
          }
        }
      } else if (key !== 'id' && key !== thisType && key !== parentType) {
        if (resourceHash[key] === 'belongsTo') {
          data['relationships'][key] = {};
          data['relationships'][key]['data'] = {};
          data['relationships'][key]['data']['id'] = payload[key];
          data['relationships'][key]['data']['type'] = key;
        } else if (resourceHash[key] === 'hasMany') {
          // TODO:
          // Need to see an example of how postgrest populates this.
          // Not used so far.
        } else {
          // Just a regular attribute. Populate the 'attributes' element.
          data['attributes'][key] = payload[key];
        }
      }
    }

    // tidy up the relationships array.
    if (Object.keys(data['relationships']).length === 0) {
      delete data['relationships'];
    }

    const return_data = {
      data: data,
      included: included,
      relationshipData: relationshipData,
    };
    return return_data;
  }

  private reformatPayload(
    primaryModelClass: ModelSchema,
    payload: Record<string, Record<string, any> | Record<string, unknown>[]>[],
    requestType: string,
  ): Record<string, any> {
    //debugger;
    const data: any = [];
    const included: Record<
      string,
      Record<string, any> | Record<string, unknown>[]
    >[] = [];

    // this populates the top level of the JSON:API responce, which does
    // not have a 'relationships' key. 'relationships' only exist as children
    // of data objects.
    payload.forEach((item: Record<string, any>) => {
      const o = this.parseRecord(
        item,
        primaryModelClass.modelName.toString(), // thisType,
        '', // ParentType
        primaryModelClass, // Model
      );

      // push the gathered item into the 'data' array.
      data.push(o['data']);

      //merge included and o['included'] removing any duplicates.
      o['included'].forEach((a: Record<string, any>) => {
        let found = false;

        included.every((b: Record<string, any>) => {
          if (a['id'] === b['id'] && a['type'] === b['type']) {
            found = true;
            return false;
          } else {
            return true;
          }
        });

        // The item was not located, add it to included.
        if (!found) {
          included.push(a);
        }
      });

      // Ignore relationships as that is only to be included within
      // specific items.
    });

    // Start building the final object to return.
    const payload_rtn: any = {};

    // populate the mandatory 'meta' field.
    payload_rtn['meta'] = {};

    // populate the 'data' field.
    if (requestType === 'findRecord' || data.length === 1) {
      payload_rtn['data'] = data[0];
    } else {
      payload_rtn['data'] = data;
    }

    // only include the 'included' key if there is at least one item.
    if (included.length === 1) {
      payload_rtn['included'] = included[0];
    } else if (included.length > 1) {
      payload_rtn['included'] = included;
    }
    //debugger;
    return payload_rtn;
  }

  public normalizeResponse(
    store: Store,
    primaryModelClass: ModelSchema,
    payload: any,
    id: string,
    requestType: string,
  ): Object {
    return this.reformatPayload(primaryModelClass, payload, requestType);
  }

  serialize(snapshot: Snapshot, options: Record<string, any>): Object {
    const data: Record<string, any> = {};

    if (options && options['includeId']) {
      const id = snapshot.id;
      if (id) {
        data['id'] = id;
      }
    }

    // load up the attributes
    snapshot.eachAttribute((key, attribute) => {
      if (
        snapshot.record.get('isNew') ||
        snapshot.changedAttributes()[key.toString()]
      ) {
        let value = snapshot.attr(key);
        if (value === null) {
          value = null;
        } else if (typeof value === 'boolean') {
          if (value) value = 1;
          else value = 0;
        }

        if (value !== null) {
          data[key.toString()] = value;
        }
      }
    });

    // populate the belongsTo relationships
    snapshot.eachRelationship((key, relationship) => {
      if (relationship.kind === 'belongsTo') {
        if (
          snapshot.record.get('isNew') ||
          snapshot.changedAttributes()[key.toString()]
        ) {
          const belongsToId = snapshot.belongsTo(key, { id: true });
          data[key.toString()] = belongsToId;
        }

        // if provided, use the mapping provided by `attrs` in
        // the serializer
        //let schema = this.store.modelFor(snapshot.modelName);
        // let payloadKey = this._getMappedKey(key, schema);
        // if (payloadKey === key && this.keyForRelationship) {
        //   payloadKey = this.keyForRelationship(key, 'belongsTo', 'serialize');
        // }

        // //Need to check whether the id is there for new&async records
        // if (isNone(belongsToId)) {
        //   json[payloadKey] = null;
        // } else {
        //   json[payloadKey] = belongsToId;
        // }

        // if (relationship.options.polymorphic) {
        //   this.serializePolymorphicType(snapshot, json, relationship);
        // }
        // } else if (relationship.kind === 'hasMany') {
        //   //this.serializeHasMany(snapshot, json, relationship);
        // }
      }
    });
    return data;
  }
}
