import { Test, TestingModule } from '@nestjs/testing';
import { UsersBatchUploadService } from './users-batch-upload.service';

describe('UsersBatchUploadService', () => {
  let service: UsersBatchUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersBatchUploadService],
    }).compile();

    service = module.get<UsersBatchUploadService>(UsersBatchUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
