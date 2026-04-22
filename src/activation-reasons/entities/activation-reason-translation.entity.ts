import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ActivationReason } from './activation-reason.entity';
import { Language } from 'src/languages/entities/language.entity';

@Unique(['activationReason', 'language'])
@Entity('activation_reason_translations')
export class ActivationReasonTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @ManyToOne(
    () => ActivationReason,
    (activationReason) => activationReason.translations,
    {
      onDelete: 'CASCADE',
    },
  )
  activationReason: ActivationReason;

  @ManyToOne(() => Language, {
    onDelete: 'CASCADE',
  })
  language: Language;
}