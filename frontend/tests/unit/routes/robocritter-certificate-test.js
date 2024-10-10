import { module, test } from 'qunit';
import { setupTest } from 'mrg-sign-in/tests/helpers';

module('Unit | Route | robocritter-certificate', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:robocritter-certificate');
    assert.ok(route);
  });
});
