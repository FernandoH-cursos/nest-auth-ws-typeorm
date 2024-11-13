import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Product } from 'src/products/entities';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', {
    //* 'select: false' indica que el campo no se devolverá en las consultas
    select: false,
  })
  password: string;

  @Column('text')
  fullName: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('text', { array: true, default: ['user'] })
  roles: string[];
  //* Se define la relación entre la entidad User y Product de uno a muchos.
  @OneToMany(() => Product, (product) => product)
  product: Product;

  //* Convirtiendo el email a minúsculas y eliminando espacios antes de insertar o actualizar el registro
  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
