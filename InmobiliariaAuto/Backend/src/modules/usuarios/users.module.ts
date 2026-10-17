import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Usuario } from './entities/usuario.entity';
import { Agenda } from './entities/agenda.entity';
import { Notificacion } from './entities/notificacion.entity';
import { Bloqueo } from './entities/bloqueo.entity';
import { Resena } from './entities/resena.entity';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Agenda, Notificacion, Bloqueo, Resena]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'super_secret_jwt_key_inmobiliaria_autogestion_2026',
        signOptions: { expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '7d') as any },
      }),
    }),
    ConfigModule,
  ],
  providers: [AuthService, UsersService, JwtStrategy],
  controllers: [AuthController, UsersController],
  exports: [AuthService, UsersService, JwtStrategy, TypeOrmModule],
})
export class UsersModule {}
