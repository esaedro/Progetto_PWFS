import { Module, forwardRef } from '@nestjs/common';
import { ServerCoursesController } from './courses.controller';
import { ServerCoursesService } from './courses.service';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ServerExamsModule } from '@server/exams';


@Module({
  imports: [forwardRef(() => ServerExamsModule)],
  controllers: [ServerCoursesController],
  providers: [ServerCoursesService],
  exports: [ServerCoursesService],
})
export class ServerCoursesModule {}
