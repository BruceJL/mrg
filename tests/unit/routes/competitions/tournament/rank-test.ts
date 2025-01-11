import { module, test } from 'qunit';
import { setupTest } from 'mrg-sign-in/tests/helpers';

module('Unit | Route | competitions/tournament/rank', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:competitions/tournament/rank');
    assert.ok(route);
  });
});
