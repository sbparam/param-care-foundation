// db/seed.ts
import * as bcrypt from 'bcrypt';
import {
  Auth,
  UserRole,
  UserStatus,
} from 'src/modules/auth/entities/auth.entity';
import dataSource from './data-source';

const seed = async () => {
  try {
    await dataSource.initialize();
    const userRepo = dataSource.getRepository(Auth);

    // ---- Seed Admin User ----
    const adminEmail = 'admin@example.com';
    const existingAdmin = await userRepo.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Param@123', 10); // Use a secure password in production

      const adminUser = userRepo.create({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        isVerified: true,
      });

      await userRepo.save(adminUser);
      console.log('✅ Admin user seeded successfully.');
    } else {
      console.log('Admin user already exists. Skipping admin seeding...');
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await dataSource.destroy();
  }
};

seed();
