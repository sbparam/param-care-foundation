import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/modules/auth/entities/auth.entity';
import { TokenType } from 'src/modules/token/entities/token.entity';
import { TokenService } from 'src/modules/token/token.service';

@Injectable()
export class RoleGuards implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.get<UserRole>(
      'role',
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({ message: 'User Not Authorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.tokenService.verifyToken(
        token,
        TokenType.ACCESS,
      );

      // Always attach user data to request
      request.user = {
        id: payload['userId'],
        userId: payload['userId'],
        userRole: payload['userRole'],
        ...payload,
      };

      // If a specific role is required, check it
      if (requiredRole && payload['userRole'] !== requiredRole) {
        throw new UnauthorizedException({ message: 'Insufficient Role' });
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException({
        message: error.message || 'User Not Authorized',
      });
    }
  }
}
