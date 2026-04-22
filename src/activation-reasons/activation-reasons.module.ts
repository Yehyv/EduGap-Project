import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivationReason } from './entities/activation-reason.entity';
import { ActivationReasonTranslation } from './entities/activation-reason-translation.entity';
import { ActivationReasonsService } from './activation-reasons.service';
import { ActivationReasonsController } from './activation-reasons.controller';
import { Language } from 'src/languages/entities/language.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivationReason,
      ActivationReasonTranslation,
      Language,
    ]),
  ],
  controllers: [ActivationReasonsController],
  providers: [ActivationReasonsService],
  exports: [ActivationReasonsService],
})
export class ActivationReasonsModule {}