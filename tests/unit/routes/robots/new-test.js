import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | robots/new', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:robots/new');
    assert.ok(route);
  });
});
