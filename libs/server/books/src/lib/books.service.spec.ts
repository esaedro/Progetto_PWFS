import { Test } from '@nestjs/testing';
import { OrgBooksService } from './books.service';

describe('OrgBooksService', () => {
  let service: OrgBooksService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OrgBooksService],
    }).compile();

    service = module.get(OrgBooksService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
