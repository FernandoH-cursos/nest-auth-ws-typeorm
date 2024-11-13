import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ProductsService } from 'src/products/products.service';
import { User } from 'src/auth/entities/user.entity';
import { seedData } from './data';

import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();

    const adminUser = await this.insertUsers();

    await this.insertNewProducts(adminUser);
  }

  private async deleteTables() {
    //* Eliminamos todos los productos
    await this.productsService.deleteAllProducts();

    //* Eliminamos todos los usuarios
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    await queryBuilder.delete().where({}).execute();
  }

  private async insertUsers() {
    const seedUsers = seedData.users;

    const users: User[] = [];

    //* Creamos un array de usuarios a partir de los datos de seedData
    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user));
    });

    //* Insertamos los usuarios en la base de datos
    await this.userRepository.save(users);

    return users[0];
  }

  private async insertNewProducts(user: User) {
    //* Eliminamos todos los productos
    await this.productsService.deleteAllProducts();

    //* Productos a insertar de data.ts
    const products = seedData.products;

    //* Array de promesas para insertar los productos
    const insertPromises = [];

    //* Insertamos los productos en la base de datos uno por uno y guardamos las promesas en el array
    products.forEach((product) => {
      insertPromises.push(this.productsService.create(product, user));
    });

    //* Esperamos a que todas las promesas se resuelvan para continuar con el proceso de seeding
    await Promise.all(insertPromises);
  }
}
