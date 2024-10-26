import { fn } from '@ember/helper';
import { changesetSet }  from 'ember-changeset/helpers/changeset-set';
import { changesetGet }  from 'ember-changeset/helpers/changeset-get';

<template>
  <input
    aria-label="Change Property"
    value={{changesetGet @changeset @propertyName}}
    update={{fn (changesetSet @changeset @propertyName)}}
    class={{if (changesetGet @changeset.error @propertyName) "full-width-error" "full-width"}}
  />
</template>
