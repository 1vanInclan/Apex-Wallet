import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'SUPER_SECRET_KEY_APEX_WALLET',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [JwtStrategy, AuthService],
  exports: [JwtStrategy, PassportModule],
  controllers: [AuthController],
})
export class AuthModule {}
