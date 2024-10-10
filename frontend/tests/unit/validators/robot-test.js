import { module, test } from 'qunit';
import validateRobot from 'mrg-sign-in/validators/robot';

module('Unit | Validator | robot', function() {
  test('it exists', function(assert) {
    assert.ok(validateRobot());
  });
});
