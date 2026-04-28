import { Module } from '@nestjs/common';
import { OrgBooksController } from './books.controller';
import { OrgBooksService } from './books.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './address.entity';
import { Author } from './author.entity';
import { Book } from './book.entity';
import { Category } from './category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Address,Author,Book,Category])],
  controllers: [OrgBooksController],
  providers: [OrgBooksService],
  exports: [OrgBooksService],
})
export class OrgBooksModule {}
