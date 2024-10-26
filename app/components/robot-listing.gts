import { LinkTo } from '@ember/routing';

<template>
  <table class="list">
    <thead>
      <tr>
        <th>#</th>
        <th>Robot</th>
        <th>Competition</th>
        <th>School</th>
        <th>Driver</th>
        <th>Late</th>
        <th>Invoiced</th>
        <th>Paid</th>
        <th>Checked In</th>
        <th>Measured</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody>
      {{#each @robots as |item|}}
        <tr class={{item.readyToCompete}}>
          <td>{{item.id}}</td>
          <td><LinkTo @route="robots.edit" @model={{item.id}}>{{item.name}}</LinkTo></td>
          <td>{{item.competition.name}}</td>
          <td>{{item.school}}</td>
          <td>{{item.driver1}}</td>
          <td>{{#if item.late}}LATE{{/if}}</td>
          <td>{{item.formattedInvoicedDollars}}</td>
          <td>{{item.formattedPaidDollars}}</td>
          <td class="centered">{{item.checkInStatus}}</td>
          <td class="centered">{{item.formattedMeasured}}</td>
          <td class="centered">{{item.slottedStatus}}</td>
        </tr>
      {{/each}}
    </tbody>
  </table>
</template>
