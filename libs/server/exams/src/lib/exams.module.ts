import { Module } from '@nestjs/common';
import { ServerExamsController } from './exams.controller';
import { ServerExamsService } from './exams.service';
import { ServerCoursesService } from '@server/courses';

@Module({
    imports: [ServerCoursesService],
    controllers: [ServerExamsController],
    providers: [ServerExamsService],
    exports: [ServerExamsService],
})
export class ServerExamsModule { }
