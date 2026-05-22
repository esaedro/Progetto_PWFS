import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServerUsersModule } from '@server/users';
import { DatabaseModule } from '@org/database';
import { ServerAuthModule } from '@server/auth';
import { ServerCoursesModule } from '@server/courses';
import { ServerExamsModule } from '@server/exams';
import { ServerPeopleModule } from '@server/people';

@Module({
  imports: [ServerUsersModule, 
    DatabaseModule,
    ServerAuthModule, 
    ServerCoursesModule, 
    ServerExamsModule,
    ServerPeopleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
