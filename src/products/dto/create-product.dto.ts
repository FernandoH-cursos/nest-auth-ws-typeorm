import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

//* La difencia entre @IsNumber y @IsInt es que el primero acepta decimales y el segundo solo enteros
export class CreateProductDto {
  //* 'nullable' indica si el campo es opcional o no, 'minLength' indica la longitud mínima del campo
  @ApiProperty({
    description: 'Product title (unique)',
    nullable: false,
    minLength: 1,
  })
  @IsString()
  title: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  //* @IsArray valida que el valor sea un array y @IsString({ each: true }) valida que cada elemento del array sea un string
  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  sizes: string[];

  //* @IsIn valida que el valor sea uno de los valores especificados
  @ApiProperty()
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags: string[];

  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];
}
