import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'product_images' })
export class ProductImage {
  //* Definimos la propiedad id como la clave primaria de la entidad y que sea autoincremental
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  url: string;

  //* @ManyToOne() define la relación entre la entidad ProductImage y Product de muchos a uno.
  //* Product es la entidad secundaria y ProductImage es la entidad principal.
  //* 'product' es la entidad Product. Es decir, el FK que se usará para la relación.
  //* onDelete: 'CASCADE' indica que si se elimina un producto, también se eliminarán todas las imágenes relacionadas.
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  product: Product;
}
