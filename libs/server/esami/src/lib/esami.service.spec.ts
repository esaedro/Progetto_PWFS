import { Test } from '@nestjs/testing';
import { ServerEsamiService } from './esami.service';

describe('ServerEsamiService', () => {
  let service: ServerEsamiService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ServerEsamiService],
    }).compile();

    service = module.get(ServerEsamiService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
