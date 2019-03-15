import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | robots/index', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:robots/index');
    assert.ok(route);
  });
});
