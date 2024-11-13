// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

//* 'PartialType' lo usamos de swagger para que aparte de heredar las propiedades de 'CreateProductDto' también podamos documentarlo.
export class UpdateProductDto extends PartialType(CreateProductDto) {}
