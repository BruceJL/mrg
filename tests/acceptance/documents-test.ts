import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'mrg-sign-in/tests/helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | documents', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    await authenticateSession();
  });

  test('/documents is well loaded', async function (assert) {
    await visit('/documents');
    assert.strictEqual(currentURL(), '/documents');
    assert.dom('[data-test-header="Robot Labels"]').exists();
    assert.dom('[data-test-header="Participation Certificates"]').exists();
    assert.dom('[data-test-header="Volunteer Certificate"]').exists();
  });
});
