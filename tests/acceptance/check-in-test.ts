import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'mrg-sign-in/tests/helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | check in', function (hooks) {
  setupApplicationTest(hooks);
  const year = new Date().getFullYear();
  const competitionId = `MSA_${year}`;

  hooks.beforeEach(async function () {
    await authenticateSession();
  });

  test('/checkin/:competition_id is well loaded', async function (assert) {
    await visit(`/checkin/${competitionId}`);
    assert.strictEqual(currentURL(), `/checkin/${competitionId}`);
  });
});
