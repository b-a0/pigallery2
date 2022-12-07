import {IPrivateConfig} from '../../config/private/PrivateConfig';


export interface BasicConfigDTO {
  imagesFolder: string;
  tempFolder: string;
  publicUrl: string;
  urlBase: string;
  applicationTitle: string;
  port: number;
  host: string;
}

export const BasicConfigDTOUtil = {
  mapToDTO: (s: IPrivateConfig): BasicConfigDTO => ({
    port: s.Server.port,
    host: s.Server.host,
    imagesFolder: s.Server.Media.folder,
    tempFolder: s.Server.Media.tempFolder,
    applicationTitle: s.Client.applicationTitle,
    publicUrl: s.Client.publicUrl,
    urlBase: s.Client.urlBase
  }),
  mapToConf: (config: IPrivateConfig, input: BasicConfigDTO) => {
    config.Server.port = input.port;
    config.Server.host = input.host;
    config.Server.Media.folder = input.imagesFolder;
    config.Server.Media.tempFolder = input.tempFolder;
    config.Client.publicUrl = input.publicUrl;
    config.Client.urlBase = input.urlBase;
    config.Client.applicationTitle = input.applicationTitle;
  }
};
