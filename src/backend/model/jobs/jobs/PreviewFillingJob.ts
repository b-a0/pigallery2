import {ObjectManagers} from '../../ObjectManagers';
import {ConfigTemplateEntry, DefaultsJobs} from '../../../../common/entities/job/JobDTO';
import {Job} from './Job';
import {Config} from '../../../../common/config/private/Config';
import {DatabaseType} from '../../../../common/config/private/PrivateConfig';


export class PreviewFillingJob extends Job {
  public readonly Name = DefaultsJobs[DefaultsJobs['Preview Filling']];
  public readonly ConfigTemplate: ConfigTemplateEntry[] = null;
  directoryToSetPreview: { id: number, name: string, path: string }[] = null;
  status: 'Persons' | 'Albums' | 'Directory' = 'Persons';

  public get Supported(): boolean {
    return Config.Server.Database.type !== DatabaseType.memory;
  }

  protected async init(): Promise<void> {
  }

  protected async step(): Promise<boolean> {
    if (!this.directoryToSetPreview) {
      this.Progress.log('Loading Directories to process');
      this.directoryToSetPreview = await ObjectManagers.getInstance().PreviewManager.getPartialDirsWithoutPreviews();
      this.Progress.Left = this.directoryToSetPreview.length + 2;
      return true;
    }

    switch (this.status) {
      case 'Persons':
        await this.stepPersonsPreview();
        this.status = 'Albums';
        return true;
      case 'Albums':
        await this.stepAlbumPreview();
        this.status = 'Directory';
        return true;
      case 'Directory':
        return await this.stepDirectoryPreview();
    }
    return false;
  }

  private async stepAlbumPreview(): Promise<boolean> {
    await ObjectManagers.getInstance().AlbumManager.getAlbums();
    this.Progress.log('Updating Albums preview');
    this.Progress.Processed++;
    return false;
  }

  private async stepPersonsPreview(): Promise<boolean> {
    await ObjectManagers.getInstance().PersonManager.getAll();
    this.Progress.log('Updating Persons preview');
    this.Progress.Processed++;
    return false;
  }

  private async stepDirectoryPreview(): Promise<boolean> {
    if (this.directoryToSetPreview.length === 0) {
      this.directoryToSetPreview = await ObjectManagers.getInstance().PreviewManager.getPartialDirsWithoutPreviews();
      // double check if there is really no more
      if (this.directoryToSetPreview.length > 0) {
        return true; // continue
      }
      this.Progress.Left = 0;
      return false;
    }
    const directory = this.directoryToSetPreview.shift();
    this.Progress.log('Setting preview: ' + directory.path  + directory.name);
    this.Progress.Left = this.directoryToSetPreview.length;

    await ObjectManagers.getInstance().PreviewManager.setAndGetPreviewForDirectory(directory);
    this.Progress.Processed++;
    return true;

  }


}
