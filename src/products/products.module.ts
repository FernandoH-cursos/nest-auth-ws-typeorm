import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductImage } from './entities';

import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/user.entity';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  //* Importa el módulo TypeOrmModule y usa el método forFeature() para definir la entidad Product y ProductImage.
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage, User]),
    AuthModule,
  ],
  exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}
