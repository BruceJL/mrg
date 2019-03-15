import Component from '@ember/component';


export default Component.extend({

  createMeasurement(value){
    console.log("Logging measurement of: " + value);
    var model = this.model;
    var store = this.store;
    store.createRecord('robot-measurment',
    {
      robot: model.id,
      result: value,
      type: this.measurementType
    });
    model.save();
  },

  actions: {
    paid5Dollars(changeset){
      changeset.set('paid', 5.00);
      changeset.save();
    },

    paid10Dollars(changeset){
      changeset.set('paid', 10.00);
      changeset.save();
    },

    refund(changeset){
      changeset.set('paid', 0.00);
      changeset.save();
    },

    signIn(changeset){
      changeset.set('signedIn', true);
        changeset.save();
    },

    signOut(changeset){
      changeset.set('signedIn', false);
      changeset.save();
    },

    toggleMeasured(changeset){
      changeset.toggleProperty('measured');
      changeset.save();
    },

    withdraw(changeset){
        changeset.set('withdrawn', true);
        changeset.save();
      },

      reinstate(changeset){
        changeset.set('withdrawn', false);
        changeset.save();
      },

    done(){
      this.sendAction('done');
    },

    updateCompetition(changeset, id){
        this.sendAction('updateCompetition', changeset, id);
      },

    //Ember-changeset methods
    save(changeset){
      changeset.save();
    },

    rollback(changeset){
      console.log("edit.js rollback");
      changeset.rollback();
    }
  }
});
