import { Module } from '@nestjs/common';
import { ServerExamsController } from './exams.controller';
import { ServerExamsService } from './exams.service';
import { ServerCoursesService } from '@server/courses';
import { ServerSessionsController } from './sessions.controller';

@Module({
    imports: [ServerCoursesService],
    controllers: [
        ServerExamsController, 
        ServerSessionsController        
    ],
    providers: [ServerExamsService],
    exports: [ServerExamsService],
})
export class ServerExamsModule { }
