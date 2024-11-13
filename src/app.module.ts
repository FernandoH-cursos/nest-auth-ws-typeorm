import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';

import { SeedModule } from './seed/seed.module';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';

import { join } from 'path';
import { MessagesWsModule } from './messages-ws/messages-ws.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    //* Modulo que se encarga de la conexión con la base de datos de postgres usando TypeORM
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      //* 'autoLoadEntities' es para que TypeORM busque las entidades en el proyecto y las cargue automáticamente en la base de datos
      autoLoadEntities: true,
      //* 'synchronize' es para que TypeORM cree las tablas en la base de datos si no existen (solo en desarrollo).
      //* En producción se debe desactivar
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    SeedModule,
    ProductsModule,
    CommonModule,
    FilesModule,
    AuthModule,
    MessagesWsModule,
  ],
})
export class AppModule {}
