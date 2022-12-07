import {UserRoles} from '../../common/entities/UserDTO';
import {AuthenticationMWs} from '../middlewares/user/AuthenticationMWs';
import {RenderingMWs} from '../middlewares/RenderingMWs';
import {NotificationMWs} from '../middlewares/NotificationMWs';
import {Express} from 'express';
import {VersionMWs} from '../middlewares/VersionMWs';
import {ServerTimingMWs} from '../middlewares/ServerTimingMWs';

export class NotificationRouter {
  public static route(app: Express): void {

    this.addGetNotifications(app);
  }

  private static addGetNotifications(app: Express): void {
    app.get('/api/notifications',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Guest),
      VersionMWs.injectGalleryVersion,
      NotificationMWs.list,
      ServerTimingMWs.addServerTiming,
      RenderingMWs.renderResult
    );
  }

}
