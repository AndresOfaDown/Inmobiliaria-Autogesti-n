import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './modules/usuarios/users.module';
import { PropertiesModule } from './modules/inmuebles/properties.module';
import { ContractsModule } from './modules/contratos/contracts.module';
import { PaymentsModule } from './modules/pagos/payments.module';
import { ChatModule } from './modules/chat/chat.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { AiModule } from './modules/ia/ai.module';
import { SeedModule } from './modules/seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASSWORD', '61333148'),
        database: config.get<string>('DB_NAME', 'inmobiliaria_db'),
        autoLoadEntities: true,
        synchronize: true, // Automatically synchronize schema in dev
      }),
    }),
    UsersModule,
    PropertiesModule,
    ContractsModule,
    PaymentsModule,
    ChatModule,
    BlockchainModule,
    AiModule,
    SeedModule,
  ],
})
export class AppModule {}
