import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerCoursesController } from './courses.controller';
import { ServerDegreeController } from './degree.controller';
import { ServerSubjectController } from './subject.controller';
import { ServerTeachingController } from './teaching.controller';
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
  controllers: [
    ServerCoursesController,
    ServerDegreeController,
    ServerSubjectController,
    ServerTeachingController,
  ],
  providers: [ServerCoursesService],
  exports: [ServerCoursesService],
})
export class ServerCoursesModule {}
