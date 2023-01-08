import MinimumSerializerInterface from '@ember-data/serializer';
import DS from 'ember-data';
import { service } from '@ember/service';

// export default class PostgrestSerializer implements MinimumSerializerInterface {
//     @service declare store: DS.Store;

    /*
    The `normalizeResponse` method is used to normalize a payload from the
    server to a JSON-API Document.
    */

    // normalizeResponse(
    //   store: DS.Store,
    //   primaryModelClass: DS.Model,
    //   payload: {},
    //   id: string | number,
    //   requestType: string
    // ): {} {
    //     if (requestType === 'findRecord') {
    //         JSON.parse(payload)
    //     } else if( requestType == 'findAll'){

    //     }

    //     return payload;
    // }

    // normalize(
    //   typeClass: DS.Model,
    //   hash: {}
    // ): {} {
    //     return hash;
    // }

    // serialize<K extends string | number>(
    //   snapshot: DS.Snapshot<K>,
    //   options: {}
    // ): {} {
    //     return options;
    // }
// }
