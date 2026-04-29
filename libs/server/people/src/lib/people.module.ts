import { Module } from '@nestjs/common';
import { ServerPeopleController } from './people.controller';
import { ServerPeopleService } from './people.service';

@Module({
  controllers: [ServerPeopleController],
  providers: [ServerPeopleService],
  exports: [ServerPeopleService],
})
export class ServerPeopleModule {}
