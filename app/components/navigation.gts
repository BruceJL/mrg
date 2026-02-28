import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import { LinkTo } from '@ember/routing';
import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';

export default class NavigationController extends Component {
  @service session; //EmberSimpleAuthSession
  @service router: RouterService;

  @action
  invalidateSession() {
    this.session.invalidate();
  }

  @action
  transitionToLogin(){
    this.router.transitionTo('login');
  }

  @tracked year = new Date().getFullYear();

  <template>
    <nav>
      <ul>
        {{#if this.session.isAuthenticated}}
        <li class="dropdown">
          <a href="javascript:void(0)" class="dropbtn">Robots</a>
          <div class="dropdown-content">
            <LinkTo @route="robots">Index</LinkTo>
            <LinkTo @route="robots.bulk-payment">Bulk payment</LinkTo>
          </div>
        </li>
        <li class="dropdown">
          <a href="javascript:void(0)" class="dropbtn">Competitions</a>
          <div class="dropdown-content">
            <LinkTo @route="robocritter-certificate">RC1 - Robo Critter</LinkTo>
            <LinkTo @route="competitions.show" @model="LFS_{{this.year}}">LFS - Line Follower (Scratch)</LinkTo>
            <LinkTo @route="competitions.show" @model="LFK_{{this.year}}">LFK - Line Follower (Kit)</LinkTo>
            <LinkTo @route="competitions.show" @model="LMA_{{this.year}}">LMA - Line Maze Autonomous</LinkTo>
            <LinkTo @route="competitions.show" @model="DRA_{{this.year}}">DRA - Drag Race Autonomous</LinkTo>
            <LinkTo @route="competitions.show" @model="TPM_{{this.year}}">TPM - Tractor Pull</LinkTo>
            <LinkTo @route="competitions.show" @model="NXT_{{this.year}}">NXT - Lego Challenge</LinkTo>
            <LinkTo @route="competitions.show" @model="JC1_{{this.year}}">JC1 - Judges Choice</LinkTo>
            <LinkTo @route="competitions.show" @model="SSR_{{this.year}}">SSR - Super Scramble Rookie</LinkTo>
            <LinkTo @route="competitions.show" @model="SSL_{{this.year}}">SSL - Super Scramble Light</LinkTo>
            <LinkTo @route="competitions.show" @model="SSH_{{this.year}}">SSH - Super Scramble Heavy</LinkTo>
            <LinkTo @route="competitions.show" @model="MSR_{{this.year}}">MSR - Mini Sumo Rookie</LinkTo>
            <LinkTo @route="competitions.show" @model="MS1_{{this.year}}">MS1 - Mini Sumo 1</LinkTo>
            <LinkTo @route="competitions.show" @model="MS2_{{this.year}}">MS2 - Mini Sumo 2</LinkTo>
            <LinkTo @route="competitions.show" @model="MS3_{{this.year}}">MS3 - Mini Sumo 3</LinkTo>
            <LinkTo @route="competitions.show" @model="MSA_{{this.year}}">MSA - Mini Sumo Autonomous</LinkTo>
            <LinkTo @route="competitions.show" @model="PST_{{this.year}}">PST - Prairie Sumo Tethered</LinkTo>
            <LinkTo @route="competitions.show" @model="PSA_{{this.year}}">PSA - Prairie Sumo Autonomous</LinkTo>
          </div>
        </li>

        <li class="dropdown">
          <a href="javascript:void(0)" class="dropbtn">Ring Assignments</a>
          <div class="dropdown-content">
            <LinkTo @route="ring-assignments" @model="MSR_{{this.year}}">MSR - Mini Sumo Rookie</LinkTo>
            <LinkTo @route="ring-assignments" @model="MS1_{{this.year}}">MS1 - Mini Sumo 1</LinkTo>
            <LinkTo @route="ring-assignments" @model="MS2_{{this.year}}">MS2 - Mini Sumo 2</LinkTo>
            <LinkTo @route="ring-assignments" @model="MS3_{{this.year}}">MS3 - Mini Sumo 3</LinkTo>
            <LinkTo @route="ring-assignments" @model="MSA_{{this.year}}">MSA - Mini Sumo Autonomous</LinkTo>
            <LinkTo @route="ring-assignments" @model="PST_{{this.year}}">PST - Prairie Sumo Teathered</LinkTo>
            <LinkTo @route="ring-assignments" @model="PSA_{{this.year}}">PSA - Prairie Sumo Autonomous</LinkTo>
          </div>
        </li>

        <li class="dropdown">
          <a href="javascript:void(0)" class="dropbtn">Checked-In Index</a>
          <div class="dropdown-content">
            <LinkTo @route="checkin" @model="RC1_{{this.year}}">RC1 - Robo Critter</LinkTo>
            <LinkTo @route="checkin" @model="LFS_{{this.year}}">LFS - Line Follower (Scratch)</LinkTo>
            <LinkTo @route="checkin" @model="LFK_{{this.year}}">LFK - Line Follower (Kit)</LinkTo>
            <LinkTo @route="checkin" @model="LMA_{{this.year}}">LMA - Line Maze Autonomous</LinkTo>
            <LinkTo @route="checkin" @model="DRA_{{this.year}}">DRA - Drag Race Atuonomous</LinkTo>
            <LinkTo @route="checkin" @model="TPM_{{this.year}}">TPM - Tractor Pull</LinkTo>
            <LinkTo @route="checkin" @model="NXT_{{this.year}}">NXT - Lego Challenge</LinkTo>
            <LinkTo @route="checkin" @model="JC1_{{this.year}}">JC1 - Judges Choice</LinkTo>
            <LinkTo @route="checkin" @model="SSR_{{this.year}}">SSR - Super Scramble Rookie</LinkTo>
            <LinkTo @route="checkin" @model="SSL_{{this.year}}">SSL - Super Scramble Light</LinkTo>
            <LinkTo @route="checkin" @model="SSH_{{this.year}}">SSH - Super Scramble Heavy</LinkTo>
            <LinkTo @route="checkin" @model="MSR_{{this.year}}">MSR - Mini Sumo Rookie</LinkTo>
            <LinkTo @route="checkin" @model="MS1_{{this.year}}">MS1 - Mini Sumo 1</LinkTo>
            <LinkTo @route="checkin" @model="MS2_{{this.year}}">MS2 - Mini Sumo 2</LinkTo>
            <LinkTo @route="checkin" @model="MS3_{{this.year}}">MS3 - Mini Sumo 3</LinkTo>
            <LinkTo @route="checkin" @model="MSA_{{this.year}}">MSA - Mini Sumo Autonomous</LinkTo>
            <LinkTo @route="checkin" @model="PST_{{this.year}}">PST - Prairie Sumo Tethered</LinkTo>
            <LinkTo @route="checkin" @model="PSA_{{this.year}}">PSA - Prairie Sumo Autonomous</LinkTo>
          </div>
        </li>
        <li class="dropdown">
          <LinkTo @route="documents">Documents</LinkTo>
        </li>
        <li class="dropdown-right">
          <a href="#" {{on "click" this.invalidateSession}}>{{this.session.data.authenticated.fullname}} - LOGOUT</a>
        </li>
        {{else}}
        <li class="dropdown-right">
          <a href="#" {{on "click" this.transitionToLogin}}>LOGIN</a>
        </li>
        {{/if}}
      </ul>
    </nav>
  </template>
}
