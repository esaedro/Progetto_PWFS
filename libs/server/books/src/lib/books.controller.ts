import { Controller, Get, Post } from '@nestjs/common';
import { OrgBooksService } from './books.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Library APIs')
@Controller('books')
export class OrgBooksController {
  constructor(private orgBooksService: OrgBooksService) {}

  @Post('populate')
  populateDB() {
    return this.orgBooksService.seed();
  }

  @Get()
  findAll() {
    return this.orgBooksService.findAllBooks();
  }
}


