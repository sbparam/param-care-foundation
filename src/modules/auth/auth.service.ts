import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token, TokenType } from '../token/entities/token.entity';
import { TokenService } from '../token/token.service';
import { LoginUserDto } from './dto/auth-login.dto';
import { Auth, UserRole, UserStatus } from './entities/auth.entity';
import { RefreshTokenDto } from '../token/dto/refresh-token.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private tokenService: TokenService,
    @InjectRepository(Auth)
    private userRepository: Repository<Auth>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async findAdmin(email: string) {
    const admin = await this.userRepository.findOne({
      where: { email: email, status: UserStatus.ACTIVE, role: UserRole.ADMIN },
    });
    return admin;
  }

  async loginAdmin(loginAdminDto: LoginUserDto) {
    const admin = await this.findAdmin(loginAdminDto.email);
    if (!admin) {
      throw new NotFoundException({ message: 'Invalid Email' });
    }

    if (!(await admin.isPasswordValid(loginAdminDto.password))) {
      throw new UnauthorizedException({ message: 'Invalid Password' });
    }

    const authToken = await this.tokenService.generateAuthToken(
      admin.id,
      admin.role,
      admin.email,
      admin as Auth,
    );
    console.log(`${loginAdminDto.email} logged in just now`);

    // Return user data without password and include both access and refresh tokens
    const { password, ...userWithoutPassword } = admin;
    return { ...userWithoutPassword, authToken };
  }

  async refreshAuth(refreshToken: RefreshTokenDto) {
    const tokenRecord = (await this.tokenService.verifyToken(
      refreshToken.refreshToken,
      TokenType.REFRESH,
    )) as Token; // Now returns full Token entity

    const user = await this.findById(tokenRecord.userId);
    if (!user) {
      throw new NotFoundException({ message: 'User Not Found' });
    }

    // Delete the old refresh token
    await this.tokenService.deleteToken(tokenRecord.jti);

    // Generate new tokens
    return this.tokenService.generateAuthToken(
      user.id,
      user.role,
      user.email,
      user,
    );
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.updatedAt = new Date();

    await this.userRepository.save(user);
  }

  async findById(id: number) {
    return await this.userRepository.findOne({
      where: { id: id, status: UserStatus.ACTIVE },
    });
  }

  //SERVICE METHOD FOR LOGOUT
  async logout(userId: number, refreshTokenDto: RefreshTokenDto) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException({ message: 'User Not Found' });
    }

    const tokenRecord = (await this.tokenService.verifyToken(
      refreshTokenDto.refreshToken,
      TokenType.REFRESH,
    )) as Token; // Now returns full Token entity

    await this.tokenService.deleteToken(tokenRecord.jti);
  }
}
