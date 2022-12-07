import {IPreviewManager} from '../interfaces/IPreviewManager';
import {DirectoryPathDTO} from '../../../../common/entities/DirectoryDTO';
import {MediaDTO} from '../../../../common/entities/MediaDTO';
import {SavedSearchDTO} from '../../../../common/entities/album/SavedSearchDTO';

export class PreviewManager implements IPreviewManager {
  resetPreviews(): Promise<void> {
    throw new Error('not implemented');
  }

  getPartialDirsWithoutPreviews(): Promise<{ id: number; name: string; path: string }[]> {
    throw new Error('not implemented');
  }

  getAlbumPreview(album: SavedSearchDTO): Promise<MediaDTO> {
    throw new Error('not implemented');
  }

  setAndGetPreviewForDirectory(dir: DirectoryPathDTO): Promise<MediaDTO> {
    throw new Error('not implemented');
  }
}
