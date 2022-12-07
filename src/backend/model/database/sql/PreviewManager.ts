import {Config} from '../../../../common/config/private/Config';
import {Brackets, SelectQueryBuilder, WhereExpression} from 'typeorm';
import {MediaEntity} from './enitites/MediaEntity';
import {DiskMangerWorker} from '../../threading/DiskMangerWorker';
import {ObjectManagers} from '../../ObjectManagers';
import {DatabaseType} from '../../../../common/config/private/PrivateConfig';
import {SortingMethods} from '../../../../common/entities/SortingMethods';
import {ISQLSearchManager} from './ISearchManager';
import {IPreviewManager, PreviewPhotoDTOWithID} from '../interfaces/IPreviewManager';
import {SQLConnection} from './SQLConnection';
import {SearchQueryDTO, SearchQueryTypes, TextSearch} from '../../../../common/entities/SearchQueryDTO';
import {DirectoryEntity} from './enitites/DirectoryEntity';
import {ParentDirectoryDTO} from '../../../../common/entities/DirectoryDTO';
import * as path from 'path';
import {Utils} from '../../../../common/Utils';

const LOG_TAG = '[PreviewManager]';

export class PreviewManager implements IPreviewManager {
  private static DIRECTORY_SELECT = ['directory.name', 'directory.path'];

  private static setSorting<T>(query: SelectQueryBuilder<T>): SelectQueryBuilder<T> {

    for (const sort of Config.Server.Preview.Sorting) {
      switch (sort) {
        case SortingMethods.descDate:
          query.addOrderBy('media.metadata.creationDate', 'DESC');
          break;
        case SortingMethods.ascDate:
          query.addOrderBy('media.metadata.creationDate', 'ASC');
          break;
        case SortingMethods.descRating:
          query.addOrderBy('media.metadata.rating', 'DESC');
          break;
        case SortingMethods.ascRating:
          query.addOrderBy('media.metadata.rating', 'ASC');
          break;
        case SortingMethods.descName:
          query.addOrderBy('media.name', 'DESC');
          break;
        case SortingMethods.ascName:
          query.addOrderBy('media.name', 'ASC');
          break;

      }
    }

    return query;
  }

  public async resetPreviews(): Promise<void> {
    const connection = await SQLConnection.getConnection();
    await connection.createQueryBuilder()
      .update(DirectoryEntity)
      .set({validPreview: false}).execute();
  }

  public async onNewDataVersion(changedDir: ParentDirectoryDTO): Promise<void> {
    // Invalidating Album preview
    let fullPath = DiskMangerWorker.normalizeDirPath(path.join(changedDir.path, changedDir.name));
    const query = (await SQLConnection.getConnection())
      .createQueryBuilder()
      .update(DirectoryEntity)
      .set({validPreview: false});

    let i = 0;
    const root = DiskMangerWorker.pathFromRelativeDirName('.');
    while (fullPath !== root) {
      const name = DiskMangerWorker.dirName(fullPath);
      const parentPath = DiskMangerWorker.pathFromRelativeDirName(fullPath);
      fullPath = parentPath;
      ++i;
      query.orWhere(new Brackets((q: WhereExpression) => {
        const param: { [key: string]: string } = {};
        param['name' + i] = name;
        param['path' + i] = parentPath;
        q.where(`path = :path${i}`, param);
        q.andWhere(`name = :name${i}`, param);
      }));
    }

    ++i;
    query.orWhere(new Brackets((q: WhereExpression) => {
      const param: { [key: string]: string } = {};
      param['name' + i] = DiskMangerWorker.dirName('.');
      param['path' + i] = DiskMangerWorker.pathFromRelativeDirName('.');
      q.where(`path = :path${i}`, param);
      q.andWhere(`name = :name${i}`, param);
    }));


    await query.execute();
  }

  public async getAlbumPreview(album: { searchQuery: SearchQueryDTO }): Promise<PreviewPhotoDTOWithID> {

    const albumQuery: Brackets = await (ObjectManagers.getInstance().SearchManager as ISQLSearchManager)
      .prepareAndBuildWhereQuery(album.searchQuery);
    const connection = await SQLConnection.getConnection();

    const previewQuery = (): SelectQueryBuilder<MediaEntity> => {
      const query = connection
        .getRepository(MediaEntity)
        .createQueryBuilder('media')
        .innerJoin('media.directory', 'directory')
        .select(['media.name', 'media.id', ...PreviewManager.DIRECTORY_SELECT])
        .where(albumQuery);
      PreviewManager.setSorting(query);
      return query;
    };

    let previewMedia = null;
    if (Config.Server.Preview.SearchQuery &&
      !Utils.equalsFilter(Config.Server.Preview.SearchQuery, {type: SearchQueryTypes.any_text, text: ''} as TextSearch)) {
      const previewFilterQuery = await (ObjectManagers.getInstance().SearchManager as ISQLSearchManager)
        .prepareAndBuildWhereQuery(Config.Server.Preview.SearchQuery);
      previewMedia = await previewQuery()
        .andWhere(previewFilterQuery)
        .limit(1)
        .getOne();
    }

    if (!previewMedia) {
      previewMedia = await previewQuery()
        .limit(1)
        .getOne();
    }
    return previewMedia || null;
  }


  public async getPartialDirsWithoutPreviews(): Promise<{ id: number, name: string, path: string }[]> {
    const connection = await SQLConnection.getConnection();
    return await connection
      .getRepository(DirectoryEntity)
      .createQueryBuilder('directory')
      .where('directory.validPreview = :validPreview', {validPreview: 0}) // 0 === false
      .select(['name', 'id', 'path']).getRawMany();
  }

  public async setAndGetPreviewForDirectory(dir: { id: number, name: string, path: string }): Promise<PreviewPhotoDTOWithID> {
    const connection = await SQLConnection.getConnection();
    const previewQuery = (): SelectQueryBuilder<MediaEntity> => {
      const query = connection
        .getRepository(MediaEntity)
        .createQueryBuilder('media')
        .innerJoin('media.directory', 'directory')
        .select(['media.name', 'media.id', ...PreviewManager.DIRECTORY_SELECT])
        .where(new Brackets((q: WhereExpression) => {
          q.where('media.directory = :dir', {
            dir: dir.id
          });
          if (Config.Server.Database.type === DatabaseType.mysql) {
            q.orWhere('directory.path like :path || \'%\'', {
              path: (DiskMangerWorker.pathFromParent(dir))
            });
          } else {
            q.orWhere('directory.path GLOB :path', {
              path: DiskMangerWorker.pathFromParent(dir) + '*'
            });
          }
        }));
      // Select from the directory if any otherwise from any subdirectories.
      // (There is no priority between subdirectories)
      query.orderBy(`CASE WHEN directory.id = ${dir.id} THEN 0 ELSE 1 END`, 'ASC');


      PreviewManager.setSorting(query);
      return query;
    };


    let previewMedia: PreviewPhotoDTOWithID = null;
    if (Config.Server.Preview.SearchQuery &&
      !Utils.equalsFilter(Config.Server.Preview.SearchQuery, {
        type: SearchQueryTypes.any_text,
        text: ''
      } as TextSearch)) {
      previewMedia = await previewQuery()
        .andWhere(await (ObjectManagers.getInstance().SearchManager as ISQLSearchManager)
          .prepareAndBuildWhereQuery(Config.Server.Preview.SearchQuery))
        .limit(1)
        .getOne();
    }

    if (!previewMedia) {
      previewMedia = await previewQuery()
        .limit(1)
        .getOne();
    }

    // set validPreview bit to true even if there is no preview (to prevent future updates)
    await connection.createQueryBuilder()
      .update(DirectoryEntity).set({preview: previewMedia, validPreview: true}).where('id = :dir', {
        dir: dir.id
      }).execute();

    return previewMedia || null;
  }

}
