import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AdminAuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AdminAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AdminAuthController>(AdminAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
