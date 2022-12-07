import {Pipe, PipeTransform} from '@angular/core';
import {MediaDTO, MediaDTOUtils} from '../../../common/entities/MediaDTO';
import {PhotoDTO} from '../../../common/entities/PhotoDTO';


@Pipe({name: 'photosOnly'})
export class PhotoFilterPipe implements PipeTransform {
  transform(media: MediaDTO[]): PhotoDTO[] | null {
    if (!media) {
      return null;
    }
    return media.filter((m: MediaDTO): boolean => MediaDTOUtils.isPhoto(m)) as PhotoDTO[];
  }
}
