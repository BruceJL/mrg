import { module, test } from 'qunit';
import { visit, currentURL, click, fillIn} from '@ember/test-helpers';
import { setupApplicationTest } from 'mrg-sign-in/tests/helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';

// Should use mock data generated in frontend later: ember-cli-mirage?
module('Acceptance | competitions', function (hooks) {
  setupApplicationTest(hooks);
  const competitionId = 'MSA';

  hooks.beforeEach(async function () {
    await authenticateSession();
    window.alert = () => {};  // Empty function to replace alert
  });

  hooks.afterEach(async function () {
  });

  test('/competitions/:competition_id is well loaded', async function (assert) {
    await visit(`/competitions/${competitionId}`);
    assert.strictEqual(currentURL(), `/competitions/${competitionId}`);
    assert.dom('[data-test-table]').exists();
    // Click new entry
    await click(`[data-test-newEntry]`);
    assert.strictEqual(currentURL(), `/robots/new?competition=${competitionId}`);
    assert.dom(`[data-test-header]`).hasText(`Adding a new Entry for: ${competitionId}`);
  });

  test('/competitions/:competition_id/admin is well loaded', async function (assert) {
    await visit(`/competitions/${competitionId}/admin`);
    assert.strictEqual(currentURL(), `/competitions/${competitionId}/admin`);
    // Check Buttons are present
    assert.dom('[data-test-button="Save"]').exists();
    assert.dom('[data-test-button="Undo"]').exists();
    assert.dom('[data-test-button="Set Measurment Time"]').exists();
    assert.dom('[data-test-button="Download Winners Certificates"]').exists();
    assert.dom('[data-test-button="Download Labels (PDF)"]').exists();
    assert.dom('[data-test-button="Download Labels (libreoffice)"]').exists();
    assert.dom('[data-test-button="Download Score Sheet (PDF)"]').exists();
    assert.dom('[data-test-button="Download Score Sheet (libreoffice)"]').exists();
    assert.dom('[data-test-button="Slot Checked In Entries"]').exists();
    assert.dom('[data-test-button="Reset ringAssignment"]').exists();
    assert.dom('[data-test-header="Live Score Board"]').exists();
    assert.dom('[data-test-header="Live Ranking"]').exists();
  })

  test('/competitions/tournament/:competition_id/:ring_number  and /competitions/tournament/:competition_id/:ring_number/rank is well loaded', async function (assert) {
    const rrService = this.owner.lookup('service:round-robin');
    await rrService.slotCheckedInEntries(competitionId, 2);
    await visit(`/competitions/tournament/${competitionId}/1`);
    assert.strictEqual(currentURL(), `/competitions/tournament/${competitionId}/1`);
    assert.dom('[data-test-header="Judge"]').exists();
    assert.dom('[data-test-timer]').exists();

    await visit(`/competitions/tournament/${competitionId}/1/rank`);
    assert.strictEqual(currentURL(), `/competitions/tournament/${competitionId}/1/rank`);
    assert.dom('[data-test-table="Rank"]').exists();
    await rrService.resetRingAssignment(competitionId);
  })

});
