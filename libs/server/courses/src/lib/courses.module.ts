import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerDegreeController } from './degree.controller';
import { ServerSubjectController } from './subject.controller';
import { ServerTeachingController } from './teaching.controller';
import { ServerCoursesService } from './courses.service';
import { Degree } from './degree.entity';
import { Subject } from './subject.entity';
import { Teaching } from './teaching.entity';
import { DegreeRepository } from './degree.repository';
import { SubjectRepository } from './subject.repository';
import { TeachingRepository } from './teaching.repository';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ServerPeopleModule } from '@server/people';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subject, Degree, Teaching]),
    forwardRef(() => ServerPeopleModule)
  ],
  controllers: [
    ServerDegreeController,
    ServerSubjectController,
    ServerTeachingController,
  ],
  providers: [ServerCoursesService, DegreeRepository, SubjectRepository, TeachingRepository],
  exports: [ServerCoursesService],
})
export class ServerCoursesModule {}
