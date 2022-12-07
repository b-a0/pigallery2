import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {FileDTO} from '../../../../../common/entities/FileDTO';
import {Utils} from '../../../../../common/Utils';


@Injectable()
export class BlogService {
  cache: { [key: string]: Promise<string> | string } = {};

  constructor(private networkService: NetworkService) {
  }


  public getMarkDown(file: FileDTO): Promise<string> {
    const filePath = Utils.concatUrls(file.directory.path, file.directory.name, file.name);
    if (!this.cache[filePath]) {
      this.cache[filePath] = this.networkService.getText('/gallery/content/' + filePath);
      (this.cache[filePath] as Promise<string>).then((val: string) => {
        this.cache[filePath] = val;
      });
    }
    return Promise.resolve(this.cache[filePath]);
  }

}

