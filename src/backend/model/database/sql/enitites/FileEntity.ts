import {Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {DirectoryEntity} from './DirectoryEntity';
import {FileDTO} from '../../../../../common/entities/FileDTO';
import {columnCharsetCS} from './EntityUtils';


@Entity()
export class FileEntity implements FileDTO {

  @Index()
  @PrimaryGeneratedColumn({unsigned: true})
  id: number;

  @Column(columnCharsetCS)
  name: string;

  @Index()
  @ManyToOne(type => DirectoryEntity, directory => directory.metaFile, {onDelete: 'CASCADE', nullable: false})
  directory: DirectoryEntity;
}
