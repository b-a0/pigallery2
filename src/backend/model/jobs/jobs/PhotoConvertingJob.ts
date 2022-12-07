import {Config} from '../../../../common/config/private/Config';
import {DefaultsJobs} from '../../../../common/entities/job/JobDTO';
import {FileJob} from './FileJob';
import {PhotoProcessing} from '../../fileprocessing/PhotoProcessing';


export class PhotoConvertingJob extends FileJob {
  public readonly Name = DefaultsJobs[DefaultsJobs['Photo Converting']];

  constructor() {
    super({noVideo: true, noMetaFile: true});
  }

  public get Supported(): boolean {
    return Config.Client.Media.Photo.Converting.enabled === true;
  }


  protected async shouldProcess(mPath: string): Promise<boolean> {
    return !(await PhotoProcessing.convertedPhotoExist(mPath, Config.Server.Media.Photo.Converting.resolution));
  }


  protected async processFile(mPath: string): Promise<void> {
    await PhotoProcessing.convertPhoto(mPath);
  }


}
