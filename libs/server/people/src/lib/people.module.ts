import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerPeopleController } from './people.controller';
import { ServerPeopleService } from './people.service';
import { Professor } from './professor.entity';
import { PeopleRepository } from './people.repository';
import { ServerUsersModule } from '@server/users';

@Module({
  imports: [TypeOrmModule.forFeature([Professor]), ServerUsersModule],
  controllers: [ServerPeopleController],
  providers: [ServerPeopleService, PeopleRepository],  //repository nei provider? 
  exports: [ServerPeopleService],
})
export class ServerPeopleModule {}
