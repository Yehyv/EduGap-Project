import { Test, TestingModule } from '@nestjs/testing';
import { PackageEnrollmentsService } from './package-enrollments.service';

describe('PackageEnrollmentsService', () => {
  let service: PackageEnrollmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PackageEnrollmentsService],
    }).compile();

    service = module.get<PackageEnrollmentsService>(PackageEnrollmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
