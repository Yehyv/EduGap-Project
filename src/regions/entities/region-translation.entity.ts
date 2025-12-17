import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Language } from 'src/languages/entities/language.entity';
import { Region } from './region.entity';
@Entity()
export class RegionTranslation {
  @PrimaryGeneratedColumn()
  id: number;
  @Column('varchar', { length: 255 })
  name: string;
  @ManyToOne(() => Region, (region) => region.translations, {
    onDelete: 'CASCADE',
  })
  region: Region;
  @ManyToOne(() => Language, {
    onDelete: 'CASCADE',
  })
  language: Language;
}
