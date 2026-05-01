import { Module } from '@nestjs/common';
import { ServerCoursesController } from './courses.controller';
import { ServerCoursesService } from './courses.service';


@Module({
  imports: [],
  controllers: [ServerCoursesController],
  providers: [ServerCoursesService],
  exports: [ServerCoursesService],
})
export class ServerCoursesModule {}
