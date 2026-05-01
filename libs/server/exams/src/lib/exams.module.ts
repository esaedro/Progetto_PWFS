import { Module } from '@nestjs/common';
import { ServerExamsController } from './exams.controller';
import { ServerExamsService } from './exams.service';

@Module({
  imports: [],
  controllers: [ServerExamsController],
  providers: [ServerExamsService],
  exports: [ServerExamsService],
})
export class ServerExamsModule {}
