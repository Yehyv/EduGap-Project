import { Test, TestingModule } from '@nestjs/testing';
import { SystemAuthService } from './system-auth.service';

describe('SystemAuthService', () => {
  let service: SystemAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SystemAuthService],
    }).compile();

    service = module.get<SystemAuthService>(SystemAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
