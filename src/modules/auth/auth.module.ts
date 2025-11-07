import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../token/entities/token.entity';
import { TokenModule } from '../token/token.module';
import { AdminAuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';

@Module({
  imports: [
    TokenModule,
    TypeOrmModule.forFeature([Auth, Token]),
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('AUTH_JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('AUTH_JWT_TOKEN_EXPIRES_IN_DAYS') + 'd',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AuthService, JwtService],
  exports: [AuthService],
})
export class AuthModule {}
