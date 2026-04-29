import { Module, forwardRef } from '@nestjs/common';
import { ServerExamsController } from './exams.controller';
import { ServerExamsService } from './exams.service';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ServerCoursesModule } from '@server/courses';

@Module({
  imports: [forwardRef(() => ServerCoursesModule)],
  controllers: [ServerExamsController],
  providers: [ServerExamsService],
  exports: [ServerExamsService],
})
export class ServerExamsModule {}
