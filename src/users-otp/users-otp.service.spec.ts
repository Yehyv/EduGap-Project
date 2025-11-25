import { Test, TestingModule } from '@nestjs/testing';
import { UsersOtpService } from './users-otp.service';

describe('UsersOtpService', () => {
  let service: UsersOtpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersOtpService],
    }).compile();

    service = module.get<UsersOtpService>(UsersOtpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
