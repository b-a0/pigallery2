import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {SettingsService} from '../settings.service';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';
import {ClientMapConfig} from '../../../../../common/config/public/ClientConfig';

@Injectable()
export class MapSettingsService extends AbstractSettingsService<ClientMapConfig> {
  constructor(private networkService: NetworkService,
              settingsService: SettingsService) {
    super(settingsService);

  }

  showInSimplifiedMode(): boolean {
    return false;
  }

  public updateSettings(settings: ClientMapConfig): Promise<void> {
    return this.networkService.putJson('/settings/map', {settings});
  }

}
