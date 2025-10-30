import { Test, TestingModule } from '@nestjs/testing';
import { PrerequiestContentsController } from './prerequiest-contents.controller';
import { PrerequiestContentsService } from './prerequiest-contents.service';

describe('PrerequiestContentsController', () => {
  let controller: PrerequiestContentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrerequiestContentsController],
      providers: [PrerequiestContentsService],
    }).compile();

    controller = module.get<PrerequiestContentsController>(
      PrerequiestContentsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
