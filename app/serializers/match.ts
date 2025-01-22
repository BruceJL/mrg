import PostgresSerializer from "./postgrestSerializer";
import Model from '@ember-data/model';

export default class MatchSerializer extends PostgresSerializer{

  protected parseRecord(
    payload: Record<string, any>,
    thisType: string,
    parentType: string,
    model: Model,
  ): Record<string, any> {
    const included: Record<string, any>[] = [];
    let relationshipData: Record<string, any> = {};
    const data: Record<string, any> = {};
    const resourceHash: Record<string, string> = {};

    data['id'] = payload['id'].toString();
    data['type'] = thisType;
    data['attributes'] = {};
    data['relationships'] = {};
    relationshipData = { type: thisType, id: payload['id'].toString() };

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
          data['relationships'][key]['data']['id'] = payload[key].toString();
          data['relationships'][key]['data']['type'] = (key === 'competitor1' || key === 'competitor2') ? 'robot' : key;
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
}
