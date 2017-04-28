import DS from 'ember-data';

export default DS.RESTSerializer.extend({

	//Overrideing the serializeAttibute so that only dirty data is written
	//Back to the database. snippet stolen from:
	//https://emberigniter.com/saving-only-dirty-attributes/ 
	
	serializeAttribute(snapshot, json, key, attributes) {    
    if (snapshot.record.get('isNew') || snapshot.changedAttributes()[key]) {
      this._super(snapshot, json, key, attributes);
    }
  }
});