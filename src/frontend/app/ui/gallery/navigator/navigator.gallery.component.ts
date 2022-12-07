import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {UserDTOUtils} from '../../../../../common/entities/UserDTO';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {QueryService} from '../../../model/query.service';
import {ContentService, ContentWrapperWithError, DirectoryContent} from '../content.service';
import {Utils} from '../../../../../common/Utils';
import {SortingMethods} from '../../../../../common/entities/SortingMethods';
import {Config} from '../../../../../common/config/public/Config';
import {SearchQueryTypes, TextSearch, TextSearchQueryMatchTypes} from '../../../../../common/entities/SearchQueryDTO';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {GallerySortingService} from './sorting.service';

@Component({
  selector: 'app-gallery-navbar',
  styleUrls: ['./navigator.gallery.component.css'],
  templateUrl: './navigator.gallery.component.html',
  providers: [RouterLink],
})
export class GalleryNavigatorComponent {

  public SortingMethods = SortingMethods;
  public sortingMethodsType: { key: number; value: string }[] = [];
  public readonly config = Config;
  // DefaultSorting = Config.Client.Other.defaultPhotoSortingMethod;
  public readonly SearchQueryTypes = SearchQueryTypes;
  public wrappedContent: Observable<ContentWrapperWithError>;
  public directoryContent: Observable<DirectoryContent>;
  public showFilters = false;
  private readonly RootFolderName: string;

  constructor(private authService: AuthenticationService,
              public queryService: QueryService,
              public galleryService: ContentService,
              public sortingService: GallerySortingService) {
    this.sortingMethodsType = Utils.enumToArray(SortingMethods);
    this.RootFolderName = $localize`Images`;
    this.wrappedContent = this.galleryService.content;
    this.directoryContent = this.wrappedContent.pipe(map(c => c.directory ? c.directory : c.searchResult));
  }

  get isDirectory(): boolean {
    return !!this.galleryService.content.value.directory;
  }

  get ItemCount(): number {
    const c = this.galleryService.content.value;
    return c.directory ? c.directory.mediaCount : (c.searchResult ? c.searchResult.media.length : 0);
  }

  get Routes(): NavigatorPath[] {

    const c = this.galleryService.content.value;
    if (!c.directory) {
      return [];
    }

    const path = c.directory.path.replace(new RegExp('\\\\', 'g'), '/');

    const dirs = path.split('/');
    dirs.push(c.directory.name);

    // removing empty strings
    for (let i = 0; i < dirs.length; i++) {
      if (!dirs[i] || 0 === dirs[i].length || '.' === dirs[i]) {
        dirs.splice(i, 1);
        i--;
      }
    }

    const user = this.authService.user.value;
    const arr: NavigatorPath[] = [];

    // create root link
    if (dirs.length === 0) {
      arr.push({name: this.RootFolderName, route: null});
    } else {
      arr.push({name: this.RootFolderName, route: UserDTOUtils.isDirectoryPathAvailable('/', user.permissions) ? '/' : null});
    }

    // create rest navigation
    dirs.forEach((name, index) => {
      const route = dirs.slice(0, dirs.indexOf(name) + 1).join('/');
      if (dirs.length - 1 === index) {
        arr.push({name, route: null});
      } else {
        arr.push({name, route: UserDTOUtils.isDirectoryPathAvailable(route, user.permissions) ? route : null});
      }
    });

    return arr;

  }

  get DefaultSorting(): SortingMethods {
    return this.sortingService.getDefaultSorting(this.galleryService.content.value.directory);
  }

  setSorting(sorting: SortingMethods): void {
    this.sortingService.setSorting(sorting);
  }

  getDownloadZipLink(): string {
    const c = this.galleryService.content.value;
    if (!c.directory) {
      return null;
    }
    let queryParams = '';
    Object.entries(this.queryService.getParams()).forEach(e => {
      queryParams += e[0] + '=' + e[1];
    });
    return Utils.concatUrls(Config.Client.urlBase,
      '/api/gallery/zip/',
      c.directory.path, c.directory.name, '?' + queryParams);
  }

  getDirectoryFlattenSearchQuery(): string {
    const c = this.galleryService.content.value;
    if (!c.directory) {
      return null;
    }
    return JSON.stringify({
      type: SearchQueryTypes.directory,
      matchType: TextSearchQueryMatchTypes.like,
      text: Utils.concatUrls('./', c.directory.path, c.directory.name)
    } as TextSearch);

  }

}

interface NavigatorPath {
  name: string;
  route: string;
}

