import {AuthenticationMWs} from '../middlewares/user/AuthenticationMWs';
import {Express} from 'express';
import {RenderingMWs} from '../middlewares/RenderingMWs';
import {UserRoles} from '../../common/entities/UserDTO';
import {PersonMWs} from '../middlewares/PersonMWs';
import {ThumbnailGeneratorMWs} from '../middlewares/thumbnail/ThumbnailGeneratorMWs';
import {VersionMWs} from '../middlewares/VersionMWs';
import {Config} from '../../common/config/private/Config';
import {ServerTimingMWs} from '../middlewares/ServerTimingMWs';

export class PersonRouter {
  public static route(app: Express): void {

    this.updatePerson(app);
    this.addGetPersons(app);
    this.getPersonThumbnail(app);
  }


  protected static updatePerson(app: Express): void {
    app.post(['/api/person/:name'],
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(Config.Client.Faces.writeAccessMinRole),
      VersionMWs.injectGalleryVersion,

      // specific part
      PersonMWs.updatePerson,
      ServerTimingMWs.addServerTiming,
      RenderingMWs.renderResult
    );
  }

  protected static addGetPersons(app: Express): void {
    app.get(['/api/person'],
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(Config.Client.Faces.readAccessMinRole),
      VersionMWs.injectGalleryVersion,

      // specific part
      PersonMWs.listPersons,
      // PersonMWs.addSamplePhotoForAll,
      ThumbnailGeneratorMWs.addThumbnailInfoForPersons,
      PersonMWs.cleanUpPersonResults,
      ServerTimingMWs.addServerTiming,
      RenderingMWs.renderResult
    );
  }

  protected static getPersonThumbnail(app: Express): void {
    app.get(['/api/person/:name/thumbnail'],
      // common part
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.User),
      VersionMWs.injectGalleryVersion,

      // specific part
      PersonMWs.getPerson,
      ThumbnailGeneratorMWs.generatePersonThumbnail,
      ServerTimingMWs.addServerTiming,
      RenderingMWs.renderFile
    );
  }

}
