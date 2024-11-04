import { module, test } from 'qunit';
import { setupTest } from 'mrg-sign-in/tests/helpers';

module('Unit | Controller | documents', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:documents');
    assert.ok(controller);
  });
});
