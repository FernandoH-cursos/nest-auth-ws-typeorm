import { ApiProperty } from '@nestjs/swagger';

import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/user.entity';

//* @ApiProperty() permite documentar las propiedades de la entidad. En este caso, se documentan las propiedades de la entidad Product.
//* Puede recibir un objeto con la descripción de la propiedad, un ejemplo, si es único, si tiene valor por defecto, etc.

//* El decorador @Entity() define la clase como una entidad de la base de datos usando TypeORM.
//* { name: 'products' } define el nombre de la tabla en la base de datos.
@Entity({ name: 'products' })
export class Product {
  //* @PrimaryGeneratedColumn() define la columna id como clave primaria.
  //* 'uuid' es el tipo de dato que se usará para generar el id.
  @ApiProperty({
    example: '021f6171-b848-4d3c-a1b7-832031e68702',
    description: 'Product ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //* @Column() define la columna name como una columna de la base de datos. El tipo de datos es texto y es única.
  @ApiProperty({
    example: 'T-Shirt Teslo',
    description: 'Product title',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  title: string;

  //* 'float' es el tipo de dato que se usará para el precio, permite números decimales. El valor por defecto es 0.
  @ApiProperty({
    example: 0,
    description: 'Product price',
  })
  @Column('float', { default: 0 })
  price: number;

  //* nullable: true permite que la descripción sea nula.
  @ApiProperty({
    example: 'lorem ipsum dolor sit amet consectetur adipiscing elit',
    description: 'Product description',
    default: null,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: 't-shirt-teslo',
    description: 'Product slug - for SEO',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  slug: string;

  //* 'int' es el tipo de dato que se usará para el stock, permite solo números enteros. El valor por defecto es 0.
  @ApiProperty({
    example: 10,
    description: 'Product stock',
    default: 0,
  })
  @Column('int', { default: 0 })
  stock: number;

  //* 'text' es el tipo de dato que se usará para las imágenes, es un array de texto.
  @ApiProperty({
    example: ['S', 'M', 'L', 'XL'],
    description: 'Product sizes',
  })
  @Column('text', { array: true })
  sizes: string[];

  @Column('text')
  @ApiProperty({
    example: 'women',
    description: 'Product gender',
  })
  gender: string;

  //* Por defecto, el array de tags estará vacío, pero el tipo de dato será un array de texto.
  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  //* @OneToMany() define la relación entre la entidad Product y ProductImage de uno a muchos.
  //* ProductImage es la entidad secundaria y Product es la entidad principal.
  //* {cascade: true} permite que al insertar un producto, se inserten las imágenes asociadas. También al actualizar y eliminar.
  //* 'images' es un array de ProductImage.
  @ApiProperty()
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    //* 'eager: true' permite que al obtener un producto, también se obtengan sus imágenes relacionadas.
    //* Es decir, que las imágenes se carguen automáticamente al obtener un producto.
    eager: true,
  })
  images?: ProductImage[];

  //* Se define la relación entre la entidad Product y User de muchos a uno. 'user' es la entidad User, es decir, el FK que se
  //* usará para la relación.
  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User;

  //* @BeforeInsert se ejecuta antes de insertar un registro en la base de datos.
  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title.toLowerCase().replace(/ /g, '-').replace(/'/g, '');
    }
  }

  //* @BeforeUpdate se ejecuta antes de actualizar un registro en la base de datos.
  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug.toLowerCase().replace(/ /g, '-').replace(/'/g, '');
  }
}
