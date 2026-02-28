import { module, test } from 'qunit';
import { visit, currentURL, pauseTest } from '@ember/test-helpers';
import { setupApplicationTest } from 'mrg-sign-in/tests/helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';

// Better use mock data generated in frontend later
module('Acceptance | robots', function (hooks) {
  setupApplicationTest(hooks);
  const year = new Date().getFullYear();
  const competitionId = `LFS_${year}`;


  hooks.beforeEach(async function () {
    await authenticateSession();
  });

  test('/robots page is well loaded', async function (assert) {

    await visit('/robots');
    assert.strictEqual(currentURL(), '/robots');
  });

  test('/robots/bulk-payment is well loaded', async function (assert) {
    await visit('/robots/bulk-payment');

    assert.strictEqual(currentURL(), '/robots/bulk-payment');
    assert.dom('[data-test-header]').hasText('Bulk Payment');
  })

  test('/robots/:robot_id is well loaded', async function (assert) {
    await visit('/robots/412');
    assert.strictEqual(currentURL(), '/robots/412');
  })

  test('/robots/new is well loaded', async function (assert) {
    const url_newRobot = `/robots/new?competition=${competitionId}`
    await visit(url_newRobot);
    assert.strictEqual(currentURL(), url_newRobot);
    assert.dom('[data-test-header]').hasText(`Adding a new Entry for: ${competitionId}`);
  })
});
