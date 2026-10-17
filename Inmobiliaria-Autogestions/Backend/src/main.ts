import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Asegurar que existan las carpetas de almacenamiento multimedia
  const uploadDir = join(process.cwd(), 'uploads', 'avatars');
  const uploadInmueblesDir = join(process.cwd(), 'uploads', 'inmuebles');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  if (!fs.existsSync(uploadInmueblesDir)) {
    fs.mkdirSync(uploadInmueblesDir, { recursive: true });
  }

  // Servir archivos multimedia estáticos
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Habilitar CORS para que el frontend pueda comunicarse sin bloqueos
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Prefijo global /api para todas las rutas
  app.setGlobalPrefix('api');

  // Validación automática de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Servidor Backend NestJS corriendo en: http://localhost:${port}/api`);
}
bootstrap();
