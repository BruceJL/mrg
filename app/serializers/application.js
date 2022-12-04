// // import RESTSerializer from '@ember-data/serializer/rest';
// // import { debug } from '@ember/debug';
import JSONSerializer from '@ember-data/serializer/json';

//export default class ApplicationSerializer extends RESTSerializer {
export default class ApplicationSerializer extends JSONSerializer {

    //Overrideing the serializeAttibute so that only dirty data is written
    //Back to the database. snippet stolen from:
    //https://emberigniter.com/saving-only-dirty-attributes/

    serializeAttribute(snapshot, json, key, attributes) {
        if (snapshot.record.get('isNew') || snapshot.changedAttributes()[key]) {
            super.serializeAttribute(...arguments);
        }
    }

    normalizeResponse(store, primaryModelClass, payload, id, requestType){
        //debugger;
        return super.normalizeResponse(...arguments);
    }
};