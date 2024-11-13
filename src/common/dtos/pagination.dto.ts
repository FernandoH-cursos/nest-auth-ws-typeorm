import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  //* @ApiProperty() nos permite documentar los campos de un DTO. En este caso, 'required' indica si el campo es obligatorio o no.
  //* 'type' indica el tipo de dato que se espera. 'description' es una descripción del campo y 'default' es el valor por defecto.
  @ApiProperty({
    required: false,
    type: Number,
    description: 'How many rows do you need',
    default: 10,
  })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Min(1)
  //* Indicamos que el campo limit es de tipo Number y que debe ser transformado a un número
  @Type(() => Number) // enableImplicitConversion: true
  limit?: number;

  @ApiProperty({
    required: false,
    type: Number,
    description: 'How many rows do you want to skip',
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
