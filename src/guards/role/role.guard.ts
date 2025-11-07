// // import {
// //   ExecutionContext,
// //   Injectable,
// //   CanActivate,
// //   UnauthorizedException,
// // } from '@nestjs/common';
// // import { Observable } from 'rxjs';
// // import { Reflector } from '@nestjs/core';
// // import { TokenType } from 'src/modules/token/entities/token.entity';
// // import { TokenService } from 'src/modules/token/token.service';

// // interface User {
// //   userId: number;
// //   userRole: string;
// //   iat?: number;
// //   exp?: number;
// // }

// // interface ExtendedRequest extends Request {
// //   user: User;
// // }

// // @Injectable()
// // export class RoleGuards implements CanActivate {
// //   constructor(
// //     private readonly tokenService: TokenService,
// //     private readonly reflector: Reflector,
// //   ) {}

// //   canActivate(
// //     context: ExecutionContext,
// //   ): boolean | Promise<boolean> | Observable<boolean> {
// //     const requiredRole = this.reflector.get<string>(
// //       'role',
// //       context.getHandler(),
// //     );
// //     const request = context.switchToHttp().getRequest();
// //     return this.validateRequest(request, requiredRole);
// //   }

// //   async validateRequest(
// //     request: ExtendedRequest,
// //     requiredRole: string,
// //   ): Promise<boolean> {
// //     const authHeader = request.headers['authorization'];
// //     if (authHeader && authHeader.startsWith('Bearer ')) {
// //       const token = authHeader.substring(7); // Remove "Bearer " prefix
// //       try {
// //         const decode = (await this.tokenService.verifyToken(
// //           token,
// //           TokenType.ACCESS,
// //         )) as User;
// //         if (requiredRole && decode.userRole !== requiredRole) {
// //           throw new UnauthorizedException({
// //             message: 'User Not Authorized',
// //           });
// //         }

// //         request['user'] = decode;
// //         return true;
// //       } catch (error) {
// //         console.log(error);
// //         throw new UnauthorizedException({
// //           message: 'User Not Authorized',
// //         });
// //       }
// //     }
// //     throw new UnauthorizedException({ message: 'User Not Authorized' });
// //   }
// // }

// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { UserRole } from 'src/modules/auth/entities/auth.entity';
// import { TokenType } from 'src/modules/token/entities/token.entity';
// import { TokenService } from 'src/modules/token/token.service';

// @Injectable()
// export class RoleGuards implements CanActivate {
//   constructor(
//     private reflector: Reflector,
//     private tokenService: TokenService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const requiredRole = this.reflector.get<UserRole>(
//       'role',
//       context.getHandler(),
//     );
//     if (!requiredRole) {
//       return true; // No role required, allow access
//     }

//     const request = context.switchToHttp().getRequest();
//     const authHeader = request.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       throw new UnauthorizedException({ message: 'User Not Authorized' });
//     }

//     const token = authHeader.split(' ')[1];

//     try {
//       const payload = await this.tokenService.verifyToken(
//         token,
//         TokenType.ACCESS,
//       );
//       const userRole = payload['userRole'];

//       if (userRole !== requiredRole) {
//         throw new UnauthorizedException({ message: 'Insufficient Role' });
//       }

//       // Attach user data to request for further use
//       request.user = payload;
//       return true;
//     } catch (error) {
//       throw new UnauthorizedException({
//         message: error.message || 'User Not Authorized',
//       });
//     }
//   }
// }

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
