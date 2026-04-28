import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServerUsersModule } from '@server/users';
import { OrgBooksModule } from '@org/books';
import { DatabaseModule } from '@org/database';
import { ServerAuthModule } from '@server/auth';

@Module({
  imports: [ServerUsersModule, OrgBooksModule, DatabaseModule, ServerAuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
