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
import { ServerSessionsService } from './sessions.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Exam, Session]),
        forwardRef(() => ServerCoursesModule),
    ],
    controllers: [
        ServerExamsController, 
        ServerSessionsController        
    ],
    providers: [ServerExamsService, ServerSessionsService, ExamsRepository, SessionsRepository],
    exports: [ServerExamsService, ServerSessionsService],
})
export class ServerExamsModule { }
