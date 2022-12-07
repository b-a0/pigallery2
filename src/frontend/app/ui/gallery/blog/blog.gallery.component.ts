import {Component, Input} from '@angular/core';
import {FileDTO} from '../../../../../common/entities/FileDTO';
import {BlogService} from './blog.service';
import {OnChanges} from '../../../../../../node_modules/@angular/core';

@Component({
  selector: 'app-gallery-blog',
  templateUrl: './blog.gallery.component.html',
  styleUrls: ['./blog.gallery.component.css']
})
export class GalleryBlogComponent implements OnChanges {

  @Input() mdFiles: FileDTO[];
  @Input() collapsed: boolean;
  markdowns: string[] = [];

  constructor(public blogService: BlogService) {
  }

  get SampleText(): string {
    if (!this.markdowns || this.markdowns.length < 1) {
      return '';
    }
    return this.markdowns[0].length < 203 ? this.markdowns[0] : this.markdowns[0].substr(0, 200) + '...';
  }

  onError($event: string): void {

  }

  ngOnChanges(): void {
    this.loadMarkdown().catch(console.error);
  }

  async loadMarkdown(): Promise<void> {
    this.markdowns = [];
    for (const f of this.mdFiles) {
      this.markdowns.push(await this.blogService.getMarkDown(f));
    }
  }
}

