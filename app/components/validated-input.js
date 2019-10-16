import Component from '@ember/component';

export default Component.extend({
  actions: {
    validateProperty(changeset, propertyName) {
      console.log("Checking " + propertyName);
      return changeset.validate(propertyName);
    }
  }
});
