import {IVersionManager} from '../interfaces/IVersionManager';
import {DataStructureVersion} from '../../../../common/DataStructureVersion';

export class VersionManager implements IVersionManager {
  async getDataVersion(): Promise<string> {
    return DataStructureVersion.toString();
  }

  async updateDataVersion(): Promise<void> {
    return;
  }
}
