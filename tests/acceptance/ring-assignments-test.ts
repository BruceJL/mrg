import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'mrg-sign-in/tests/helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | ring assignments', function (hooks) {
  setupApplicationTest(hooks);
  const year = new Date().getFullYear();
  const competitionId = `MSA_${year}`;

  hooks.beforeEach(async function () {
    await authenticateSession();
  });

  test('ring-assignments/:competition_id is well loaded', async function (assert) {
    await visit(`/ring-assignments/${competitionId}`);
    assert.strictEqual(currentURL(), `/ring-assignments/${competitionId}`);
    assert.dom('[data-test-table]').exists();
    assert.dom('[data-test-header]').exists();
  });
});
