import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeedService } from './seed.service';

import { ProductsModule } from 'src/products/products.module';
import { Product, ProductImage } from 'src/products/entities';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Product, ProductImage]),
    ProductsModule,
  ],
  providers: [SeedService],
})
export class SeedModule {}
