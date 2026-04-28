import { Test } from '@nestjs/testing';
import { ServerEsamiController } from './esami.controller';
import { ServerEsamiService } from './esami.service';

describe('ServerEsamiController', () => {
  let controller: ServerEsamiController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ServerEsamiService],
      controllers: [ServerEsamiController],
    }).compile();

    controller = module.get(ServerEsamiController);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });
});
