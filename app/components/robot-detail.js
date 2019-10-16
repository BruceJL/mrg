import Component from '@ember/component';

export default Component.extend({
  tagName: '', //removes <div> tag around component.

  actions: {
    updateCompetition(changeset, id) {
      this.sendAction('updateCompetition', changeset, id);
    }
  }
});
