import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Auth } from '../auth/entities/auth.entity';
import { Token, TokenType } from './entities/token.entity';
const moment = require('moment');

@Injectable()
export class TokenService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async create(token: Partial<Token>): Promise<Token> {
    return this.tokenRepository.save(this.tokenRepository.create(token));
  }

  async findTokenByJti(jti: string, type: TokenType) {
    return this.tokenRepository.findOne({
      where: { jti, type },
      relations: ['user'],
    });
  }

  async generateToken(
    userId: number,
    userRole: string,
    secretAndExpiry: object,
  ): Promise<string> {
    return this.jwtService.signAsync({ userId, userRole }, secretAndExpiry);
  }

  async generateRefreshToken(
    jti: string,
    secretAndExpiry: object,
  ): Promise<string> {
    const payload = { jti };
    return this.jwtService.signAsync(payload, secretAndExpiry);
  }

  async generateForgetPassToken(
    userId: number,
    jti: string,
    userRole: string,
    secretAndExpiry: object,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { userId, jti, userRole },
      secretAndExpiry,
    );
  }

  // async generateAuthToken(
  //   userId: number,
  //   userRole: string,
  //   userEmail: string,
  //   user: Auth,
  // ): Promise<object> {
  //   const refreshJti: string = uuidv4();

  //   // Calculate expiration times
  //   const accessTokenExpires = moment().add(
  //     this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
  //     'minutes',
  //   );
  //   const refreshTokenExpires = moment().add(
  //     this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
  //     'days',
  //   );

  //   // Prepare secrets and expiration configs
  //   const accessTokenSecretAndExpiration = {
  //     secret: this.configService.get('JWT_SECRET'),
  //     expiresIn: accessTokenExpires.diff(moment(), 'seconds'),
  //   };
  //   const refreshTokenSecretAndExpiration = {
  //     secret: this.configService.get('JWT_REFRESH_SECRET'),
  //     expiresIn: refreshTokenExpires.diff(moment(), 'seconds'),
  //   };

  //   // Generate tokens
  //   const accessToken = await this.generateToken(
  //     userId,
  //     userRole,
  //     accessTokenSecretAndExpiration,
  //   );
  //   const refreshToken = await this.generateRefreshToken(
  //     refreshJti,
  //     refreshTokenSecretAndExpiration,
  //   );

  //   // Store refresh token in database
  //   await this.create({
  //     jti: refreshJti,
  //     type: TokenType.REFRESH,
  //     userId: user.id,
  //     email: userEmail,
  //     expiresAt: refreshTokenExpires.toDate(),
  //   });

  //   return {
  //     accessToken,
  //     refreshToken,
  //   };
  // }

  async generateAuthToken(
    userId: number,
    userRole: string,
    userEmail: string,
    user: Auth,
  ): Promise<object> {
    const refreshJti: string = uuidv4();

    const accessTokenExpiry = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_EXPIRES_IN',
    ); // "8h"
    const refreshTokenExpiry = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRES_IN',
    ); // "30d"
    const forgetPassExpiry = this.configService.get<string>(
      'JWT_FORGET_PASSWORD_TOKEN_EXPIRES_IN',
    ); // "5h"

    // Let jsonwebtoken handle the string format directly! No need to calculate seconds manually.
    const accessToken = await this.jwtService.signAsync(
      { userId, userRole },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: accessTokenExpiry, // ← Just pass "8h" directly!
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { jti: refreshJti },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenExpiry, // ← "30d"
      },
    );

    // Store refresh token with correct expiry
    const refreshExpiresAt = moment().add(refreshTokenExpiry).toDate();

    await this.create({
      jti: refreshJti,
      type: TokenType.REFRESH,
      userId: user.id,
      email: userEmail,
      expiresAt: refreshExpiresAt,
    });

    return { accessToken, refreshToken };
  }

  // async generateForgetPasswordToken(
  //   userId: number,
  //   userRole: string,
  // ): Promise<object> {
  //   const forgetPasswordJti = uuidv4();

  //   const expiresAt = moment().add(
  //     this.configService.get('JWT_FORGET_PASSWORD_TOKEN_EXPIRES_IN'),
  //     'minutes',
  //   );

  //   const secretAndExpiry = {
  //     secret: this.configService.get('JWT_FORGET_PASSWORD_SECRET'),
  //     expiresIn: expiresAt.diff(moment(), 'seconds'),
  //   };

  //   const token = await this.generateForgetPassToken(
  //     userId,
  //     forgetPasswordJti,
  //     userRole,
  //     secretAndExpiry,
  //   );

  //   await this.create({
  //     jti: forgetPasswordJti,
  //     type: TokenType.RESET_PASSWORD,
  //     userId,
  //     email: '', // Optional: populate if needed
  //     expiresAt: expiresAt.toDate(),
  //   });

  //   return { forgetPasswordToken: token, forgetPasswordJti };
  // }

  async generateForgetPasswordToken(
    userId: number,
    userRole: string,
  ): Promise<object> {
    const jti = uuidv4();
    const expiresIn = this.configService.get<string>(
      'JWT_FORGET_PASSWORD_TOKEN_EXPIRES_IN',
    ); // "5h"

    const token = await this.jwtService.signAsync(
      { userId, jti, userRole },
      {
        secret: this.configService.get('JWT_FORGET_PASSWORD_SECRET'),
        expiresIn, // ← Just pass "5h" directly
      },
    );

    await this.create({
      jti,
      type: TokenType.RESET_PASSWORD,
      userId,
      email: '',
      expiresAt: moment().add(expiresIn).toDate(),
    });

    return { forgetPasswordToken: token, forgetPasswordJti: jti };
  }

  async verifyToken(token: string, tokenType: TokenType): Promise<object> {
    let secret: string;

    switch (tokenType) {
      case TokenType.ACCESS:
        secret = this.configService.get('JWT_SECRET')!;
        break;
      case TokenType.REFRESH:
        secret = this.configService.get('JWT_REFRESH_SECRET')!;
        break;
      case TokenType.RESET_PASSWORD:
        secret = this.configService.get('JWT_FORGET_PASSWORD_SECRET')!;
        break;
      default:
        throw new UnauthorizedException({ message: 'Invalid Token Type' });
    }
    try {
      const verifiedToken = await this.jwtService.verifyAsync(token, {
        secret,
      });

      // For refresh and reset password tokens, verify they exist in database
      if (
        tokenType === TokenType.REFRESH ||
        tokenType === TokenType.RESET_PASSWORD
      ) {
        const tokenRecord = await this.findTokenByJti(
          verifiedToken.jti,
          tokenType,
        );
        if (!tokenRecord) {
          throw new UnauthorizedException({
            message: 'Invalid or Expired Token',
          });
        }
        return tokenRecord; // Return the full token record for refresh tokens
      }

      return verifiedToken;
    } catch (error) {
      throw new UnauthorizedException({ message: 'Invalid or Expired Token' });
    }
  }

  async deleteToken(jti: string): Promise<object> {
    return await this.tokenRepository.delete({ jti });
  }
}
