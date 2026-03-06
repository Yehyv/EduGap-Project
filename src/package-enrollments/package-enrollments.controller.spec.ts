import { Test, TestingModule } from '@nestjs/testing';
import { PackageEnrollmentsController } from './package-enrollments.controller';
import { PackageEnrollmentsService } from './package-enrollments.service';

describe('PackageEnrollmentsController', () => {
  let controller: PackageEnrollmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackageEnrollmentsController],
      providers: [PackageEnrollmentsService],
    }).compile();

    controller = module.get<PackageEnrollmentsController>(
      PackageEnrollmentsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
