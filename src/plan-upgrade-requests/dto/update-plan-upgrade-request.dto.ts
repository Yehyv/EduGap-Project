import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanUpgradeRequestDto } from './create-plan-upgrade-request.dto';

export class UpdatePlanUpgradeRequestDto extends PartialType(CreatePlanUpgradeRequestDto) {}
