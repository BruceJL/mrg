import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | robot listing', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{robot-listing}}`);

    assert.dom('*').hasText('');

    // Template block usage:
    await render(hbs`
      <RobotListing>
        template block text
      </RobotListing>
    `);

    assert.dom('*').hasText('template block text');
  });
});
