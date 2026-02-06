import { Test, TestingModule } from '@nestjs/testing';
import { UsersBatchUploadController } from './users-batch-upload.controller';
import { UsersBatchUploadService } from './users-batch-upload.service';

describe('UsersBatchUploadController', () => {
  let controller: UsersBatchUploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersBatchUploadController],
      providers: [UsersBatchUploadService],
    }).compile();

    controller = module.get<UsersBatchUploadController>(
      UsersBatchUploadController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
