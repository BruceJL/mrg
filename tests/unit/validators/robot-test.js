import { module, test } from 'qunit';

module('Unit | Validator | robot', function () {
  test('it exists', function (assert) {
    assert.ok(validate());
  });

  test('it does something', function (assert) {
    let key = 'email';
    let options = {
      /* ... */
    };
    let validator = validateUniqueness(options);

    assert.equal(validator(key, undefined) /* ... */);
    assert.equal(validator(key, null) /* ... */);
    assert.equal(validator(key, '') /* ... */);
    assert.equal(validator(key, 'foo@bar.com') /* ... */);
  });
});
