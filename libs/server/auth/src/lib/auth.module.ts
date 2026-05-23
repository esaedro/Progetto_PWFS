import { Module, forwardRef} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ServerUsersModule } from '@server/users';
import { ServerAuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ServerAuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { ServerPeopleModule } from '@server/people';
import 'dotenv/config';

@Module({
  imports: [
    ServerUsersModule,
    forwardRef(() => ServerPeopleModule),
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '24h' }
    })
  ],
  controllers: [ServerAuthController],
  providers: [ServerAuthService,LocalStrategy,JwtStrategy],
  exports: [ServerAuthService],
})
export class ServerAuthModule {}

