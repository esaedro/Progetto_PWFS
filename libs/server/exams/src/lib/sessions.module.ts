import { Module } from '@nestjs/common';
import { ServerSessionsController } from './sessions.controller';
import { ServerSessionsService } from './sessions.service';

@Module({
    imports: [],
    controllers: [ServerSessionsController],
    providers: [ServerSessionsService],
    exports: [ServerSessionsService],
})
export class ServerExamsModule { }
