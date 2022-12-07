import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';
import {SettingsService} from '../settings.service';
import {ServerPreviewConfig} from '../../../../../common/config/private/PrivateConfig';

@Injectable()
export class PreviewSettingsService
  extends AbstractSettingsService<ServerPreviewConfig> {
  constructor(private networkService: NetworkService,
              settingsService: SettingsService) {
    super(settingsService);
  }


  showInSimplifiedMode(): boolean {
    return false;
  }

  public updateSettings(settings: ServerPreviewConfig): Promise<void> {
    return this.networkService.putJson('/settings/preview', {settings});
  }

}
