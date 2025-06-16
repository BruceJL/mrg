import Service, { service } from '@ember/service';
import type Store from '@ember-data/store';
import FlashMessageService from './flash-message';

export default class RobotService extends Service {
  @service declare store: Store;
  @service declare flashMessage: FlashMessageService;

  async getRobotById(id: string, expectedCompetitionId: string) {
    try {
      const robot = await this.store.findRecord('robot', id, { include: 'competition' });

      if (robot.competition.id !== expectedCompetitionId) {
        this.flashMessage.show(`Robot ID ${id} does not belong to this competition`, 'error');
        return null;
      }

      return robot;
    } catch (e) {
      this.flashMessage.show(`Could not find robot with ID ${id}`, 'error');
      return null;
    }
  }

  async deleteRobot(robot: any): Promise<boolean> {
    try {
      robot.deleteRecord();
      await robot.save();
      this.flashMessage.show(`Robot ${robot.name} deleted successfully`, 'success');
      return true;
    } catch (e: any) {
      this.flashMessage.show(`Failed to delete robot: ${e.message || e}`, 'error');
      return false;
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    'robot-service': RobotService;
  }
}
