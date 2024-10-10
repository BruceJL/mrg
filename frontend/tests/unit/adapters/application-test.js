import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | application', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let adapter = this.owner.lookup('adapter:application');
    assert.ok(adapter);
  });

  test('Produce a findAll URL', function(assert) {
    let adapter = this.owner.lookup('adapter:application');

    let s = someThing.findAllUrl("robot");
    assert.equal(s, './robot');
  });
});
