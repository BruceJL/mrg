import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import { LinkTo } from '@ember/routing';
import { on } from '@ember/modifier';

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
            <LinkTo @route="competitions.show" @model="LFS">LFS - Line Follower (Scratch)</LinkTo>
            <LinkTo @route="competitions.show" @model="LFK">LFK - Line Follower (Kit)</LinkTo>
            <LinkTo @route="competitions.show" @model="LMA">LMA - Line Maze Autonomous</LinkTo>
            <LinkTo @route="competitions.show" @model="DRA">DRA - Drag Race Autonomous</LinkTo>
            <LinkTo @route="competitions.show" @model="TPM">TPM - Tractor Pull</LinkTo>
            <LinkTo @route="competitions.show" @model="NXT">NXT - Lego Challenge</LinkTo>
            <LinkTo @route="competitions.show" @model="JC1">JC1 - Judges Choice</LinkTo>
            <LinkTo @route="competitions.show" @model="SSR">SSR - Super Scramble Rookie</LinkTo>
            <LinkTo @route="competitions.show" @model="SSL">SSL - Super Scramble Light</LinkTo>
            <LinkTo @route="competitions.show" @model="SSH">SSH - Super Scramble Heavy</LinkTo>
            <LinkTo @route="competitions.show" @model="MSR">MSR - Mini Sumo Rookie</LinkTo>
            <LinkTo @route="competitions.show" @model="MS1">MS1 - Mini Sumo 1</LinkTo>
            <LinkTo @route="competitions.show" @model="MS2">MS2 - Mini Sumo 2</LinkTo>
            <LinkTo @route="competitions.show" @model="MS3">MS3 - Mini Sumo 3</LinkTo>
            <LinkTo @route="competitions.show" @model="MSA">MSA - Mini Sumo Autonomous</LinkTo>
            <LinkTo @route="competitions.show" @model="PST">PST - Prairie Sumo Tethered</LinkTo>
            <LinkTo @route="competitions.show" @model="PSA">PSA - Prairie Sumo Autonomous</LinkTo>
          </div>
        </li>

        <li class="dropdown">
          <a href="javascript:void(0)" class="dropbtn">Ring Assignments</a>
          <div class="dropdown-content">
            <LinkTo @route="ring-assignments" @model="MSR">MSR - Mini Sumo Rookie</LinkTo>
            <LinkTo @route="ring-assignments" @model="MS1">MS1 - Mini Sumo 1</LinkTo>
            <LinkTo @route="ring-assignments" @model="MS2">MS2 - Mini Sumo 2</LinkTo>
            <LinkTo @route="ring-assignments" @model="MS3">MS3 - Mini Sumo 3</LinkTo>
            <LinkTo @route="ring-assignments" @model="MSA">MSA - Mini Sumo Autonomous</LinkTo>
            <LinkTo @route="ring-assignments" @model="PST">PST - Prairie Sumo Teathered</LinkTo>
            <LinkTo @route="ring-assignments" @model="PSA">PSA - Prairie Sumo Autonomous</LinkTo>
          </div>
        </li>

        <li class="dropdown">
          <a href="javascript:void(0)" class="dropbtn">Checked-In Index</a>
          <div class="dropdown-content">
            <LinkTo @route="checkin" @model="RC1">RC1 - Robo Critter</LinkTo>
            <LinkTo @route="checkin" @model="LFS">LFS - Line Follower (Scratch)</LinkTo>
            <LinkTo @route="checkin" @model="LFK">LFK - Line Follower (Kit)</LinkTo>
            <LinkTo @route="checkin" @model="LMA">LMA - Line Maze Autonomous</LinkTo>
            <LinkTo @route="checkin" @model="DRA">DRA - Drag Race Atuonomous</LinkTo>
            <LinkTo @route="checkin" @model="TPM">TPM - Tractor Pull</LinkTo>
            <LinkTo @route="checkin" @model="NXT">NXT - Lego Challenge</LinkTo>
            <LinkTo @route="checkin" @model="JC1">JC1 - Judges Choice</LinkTo>
            <LinkTo @route="checkin" @model="SSR">SSR - Super Scramble Rookie</LinkTo>
            <LinkTo @route="checkin" @model="SSL">SSL - Super Scramble Light</LinkTo>
            <LinkTo @route="checkin" @model="SSH">SSH - Super Scramble Heavy</LinkTo>
            <LinkTo @route="checkin" @model="MSR">MSR - Mini Sumo Rookie</LinkTo>
            <LinkTo @route="checkin" @model="MS1">MS1 - Mini Sumo 1</LinkTo>
            <LinkTo @route="checkin" @model="MS2">MS2 - Mini Sumo 2</LinkTo>
            <LinkTo @route="checkin" @model="MS3">MS3 - Mini Sumo 3</LinkTo>
            <LinkTo @route="checkin" @model="MSA">MSA - Mini Sumo Autonomous</LinkTo>
            <LinkTo @route="checkin" @model="PST">PST - Prairie Sumo Tethered</LinkTo>
            <LinkTo @route="checkin" @model="PSA">PSA - Prairie Sumo Autonomous</LinkTo>
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
