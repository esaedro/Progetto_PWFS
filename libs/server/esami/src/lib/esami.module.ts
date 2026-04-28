import { Module } from '@nestjs/common';
import { ServerEsamiController } from './esami.controller';
import { ServerEsamiService } from './esami.service';

@Module({
  controllers: [ServerEsamiController],
  providers: [ServerEsamiService],
  exports: [ServerEsamiService],
})
export class ServerEsamiModule {}
