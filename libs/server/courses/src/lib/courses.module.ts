import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerCoursesController } from './courses.controller';
import { ServerCoursesService } from './courses.service';
import { Degree } from './degree.entity';
import { Subject } from './subject.entity';
import { Teaching } from './teaching.entity';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ServerPeopleModule } from '@server/people';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subject, Degree, Teaching]),
    ServerPeopleModule
  ],
  controllers: [ServerCoursesController],
  providers: [ServerCoursesService],
  exports: [ServerCoursesService],
})
export class ServerCoursesModule {}
