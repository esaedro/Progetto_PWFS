import { Test } from '@nestjs/testing';
import { OrgBooksController } from './books.controller';
import { OrgBooksService } from './books.service';

describe('OrgBooksController', () => {
  let controller: OrgBooksController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OrgBooksService],
      controllers: [OrgBooksController],
    }).compile();

    controller = module.get(OrgBooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });
});
