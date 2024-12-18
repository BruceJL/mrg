<template>
  <table class="list">
    <thead>
      <tr>
        <th>Robot</th>
        <th>School</th>
        <th>Driver</th>
        <th>Checked In</th>
        <th>Measured</th>
        <th>Paid</th>
        <th>Slotted</th>
      </tr>
    </thead>

    <tbody>
      {{#each @robots as |item|}}
        <tr class={{item.readyToCompete}}>
          <td>{{item.name}}</td>
          <td>{{item.school}}</td>
          <td>{{item.driver1}}</td>
          <td class="centered">{{item.checkInStatus}}</td>
          <td class="centered">{{item.formattedMeasured}}</td>
          <td class="centered">{{item.formattedPaidDollars}}</td>
          <td class="centered">{{item.slottedStatus}}</td>
        </tr>
      {{/each}}
    </tbody>
  </table>
</template>
