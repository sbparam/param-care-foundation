// require('dotenv').config();
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // Global route prefix
//   app.setGlobalPrefix('api/v1');
//   // Enabling CORS
//   app.enableCors();

//   await app.listen(process.env.PORT ?? 3000);
//   console.log(`Server running on port ${process.env.PORT}`);
// }
// bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import * as dotenv from 'dotenv';

// async function bootstrap() {
//   dotenv.config();

//   const app = await NestFactory.create(AppModule);

//   app.setGlobalPrefix('api/v1');

//   app.enableCors({
//     origin: 'http://localhost:8080',
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     credentials: true,
//   });

//   await app.listen(process.env.PORT ?? 3000);
//   console.log(`Server running on port ${process.env.PORT}`);
// }

// bootstrap();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server running on port ${process.env.PORT}`);
}

bootstrap();
