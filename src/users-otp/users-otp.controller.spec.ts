import { Test, TestingModule } from '@nestjs/testing';
import { UsersOtpController } from './users-otp.controller';
import { UsersOtpService } from './users-otp.service';

describe('UsersOtpController', () => {
  let controller: UsersOtpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersOtpController],
      providers: [UsersOtpService],
    }).compile();

    controller = module.get<UsersOtpController>(UsersOtpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
