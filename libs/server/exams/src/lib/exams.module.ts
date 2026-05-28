import { Module, forwardRef } from '@nestjs/common';
import { ServerExamsController } from './exams.controller';
import { ServerExamsService } from './exams.service';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ServerCoursesModule } from '@server/courses';
import { ServerSessionsController } from './sessions.controller';
import { Exam } from './exam.entity';
import { Session } from './session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamsRepository } from './exams.repository';
import { SessionsRepository } from './sessions.repository';
import { ExamValidationService } from './exam-validation.service';
import { SessionValidationService } from './session-validation.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Exam, Session]),
        forwardRef(() => ServerCoursesModule),
    ],
    controllers: [
        ServerExamsController,
        ServerSessionsController
    ],
    providers: [ServerExamsService, ExamsRepository, SessionsRepository, ExamValidationService, SessionValidationService],
    exports: [ServerExamsService],
})
export class ServerExamsModule { }
