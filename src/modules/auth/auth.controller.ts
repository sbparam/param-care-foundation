import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/auth-login.dto';
import { RoleGuards } from 'src/guards/role/role.guard';
import { RefreshTokenDto } from '../token/dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/auth-reset-password.dto';
import { UserRole } from './entities/auth.entity';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() loginUserDto: LoginUserDto) {
    const loginData = await this.authService.loginAdmin(loginUserDto);
    return {
      message: 'Login Successful',
      data: loginData,
    };
  }

  // METHOD FOR REFRESH TOKEN AFTER ACCESS TOKEN IN EXPIRED
  @Post('refreshToken')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<object> {
    const refreshData: object =
      await this.authService.refreshAuth(refreshTokenDto);
    return {
      message: 'New Access and Refresh Token Assigned Successfully',
      data: { ...refreshData },
    };
  }

  @Post('updatePassword')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async updatePassword(
    @Req() req: any,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    const userId = req.user.userId;
    await this.authService.updatePassword(userId, resetPasswordDto.newPassword);
    return { message: 'Password Changed Successfully' };
  }

  @Post('logout')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req, @Body() RefreshTokenDto: RefreshTokenDto) {
    await this.authService.logout(req.user.id, RefreshTokenDto);
    return {
      message: 'Logged Out Successfully',
      data: {},
    };
  }
}
