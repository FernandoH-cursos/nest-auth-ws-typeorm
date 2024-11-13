import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';

import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { User } from 'src/auth/entities/user.entity';

import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {
  //* Permitimos que el servicio tenga un logger para mostrar mensajes en la consola. Esto es útil para depurar, ya que podemos ver
  //* de manera más clara lo que está sucediendo en nuestra aplicación.
  private readonly logger = new Logger('ProductService');

  //* Inyectamos el repositorio de Product que ofrece TypeORM
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    //* 'DataSource' es una instancia de la clase DataSource que nos permite conectarnos a la base de datos con TypeORM.
    //* Es útil para usar query runners y otras funcionalidades avanzadas de TypeORM.
    private readonly dataSource: DataSource,
  ) {}

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    //* Si ocurre un error, lo mostramos en la consola y lanzamos una excepción
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      // Validamos que todas las imágenes tengan una URL válida
      const validImages = images.filter(
        (image) => image && image.trim() !== '',
      );

      //* Creamos una instancia de Product con los datos recibidos
      const product = this.productRepository.create({
        ...productDetails,
        user,
        //* Mapeamos las imágenes recibidas a instancias de ProductImage y las asignamos al producto
        //* Esto nos permite guardar las imágenes en la base de datos de manera independiente al producto
        //* y relacionarlas con el producto a través de una relación de uno a muchos.
        //* De esta manera, podemos tener varias imágenes por producto.
        images: validImages.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
      });

      //* Guardamos el producto en la base de datos
      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    //* Buscamos todos los productos en la base de datos
    const products = await this.productRepository.find({
      //* 'take' indica cuántos registros queremos obtener
      take: limit,
      //* 'skip' indica cuántos registros queremos saltar desde el principio
      skip: offset,
      //* 'relations' nos permite cargar relaciones de la entidad Product, en este caso, se relaciona con la entidad ProductImage
      //* Es decir, que al obtener un producto, también obtendremos sus imágenes relacionadas por el product id.
      relations: {
        images: true,
      },
    });

    //* Aplanamos las imágenes de los productos para que sean solo un arreglo de strings con las URLs de las imágenes.
    return products.map((product) => ({
      ...product,
      images: product.images.map((image) => image.url),
    }));
  }

  //* Obtiene un producto por su termino y los devuelve con imagenes sin aplanar
  async findOne(term: string) {
    let product: Product;

    //* Buscamos un producto por su id
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      //* Buscamos un producto por su slug (metodo antiguo limitado a comparacion de queryBuilder)
      // product = await this.productRepository.findOneBy({ slug: term });}

      //* queryBuilder es una instancia de QueryBuilder que nos permite construir consultas SQL de manera programática
      //* es decir, sin escribir SQL directamente en el código fuente de nuestra aplicación.  Esto es útil para evitar
      //* inyecciones SQL y para mantener un código más limpio y fácil de leer.

      //* 'Product' es el alias de la tabla Product en la consulta SQL que sirve para referenciar la tabla en la consulta.
      const queryBuilder = this.productRepository.createQueryBuilder('Product');

      //* Buscamos un producto por su título o slug (en mayúsculas o minúsculas) en la base de datos.
      //* El método getOne() nos permite obtener un solo registro que cumpla con las condiciones de la consulta.
      //* Si no se encuentra ningún registro, se lanzará una excepción NotFoundException.
      //* 'where()' nos permite agregar condiciones a la consulta SQL.
      //* 'UPPER()' convierte un texto a mayúsculas en SQL.
      //* El método 'leftJoinAndSelect()' nos permite unir tablas y seleccionar columnas de la tabla secundaria.
      //* En este caso, unimos la tabla Product con la tabla ProductImage y seleccionamos las columnas de ProductImage.
      //* 'Product' es el alias de la tabla ProductImage en la consulta SQL.
      product = await queryBuilder
        .where('UPPER(title) =:title OR slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('Product.images', 'ProductImage')
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with '${term}' not found`);
    }

    return product;
  }

  //* Obtiene un producto por su termino y los devuelve con sus imagenes aplanaadas (solo las urls)
  async findOnePlain(term: string) {
    const { images = [], ...product } = await this.findOne(term);

    return {
      ...product,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    //* 'preload()' nos permite cargar un registro de la base de datos y actualizarlo con los datos recibidos
    //* en el DTO de actualización. Si el registro no existe, se devolverá 'undefined'.
    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    //* Si el producto no existe, lanzamos una excepción NotFoundException
    if (!product) {
      throw new NotFoundException(`Product with id '${id}' not found`);
    }

    //* 'createQueryRunner()' nos permite crear un query runner que nos permite ejecutar consultas SQL de manera programática.
    //* Es útil para realizar transacciones y otras operaciones avanzadas en la base de datos.
    const queryRunner = this.dataSource.createQueryRunner();
    //* Nos conectamos a la base de datos con el query runner para poder ejecutar consultas SQL en ella.
    await queryRunner.connect();
    //* Iniciamos una transacción en la base de datos para poder realizar operaciones atómicas. Es decir, que si una operación falla,
    //* se deshacen todas las operaciones realizadas en la transacción.
    await queryRunner.startTransaction();

    try {
      if (images) {
        //* Eliminamos las imágenes antiguas del producto para poder actualizarlas con las nuevas imágenes.
        //* 'queryRunner.manager.delete()' nos permite eliminar registros de la base de datos de manera programática.
        //* En este caso, eliminamos las imágenes asociadas al producto indicando el producto al que pertenecen.
        await queryRunner.manager.delete(ProductImage, { product: id });

        //* Mapeamos las imágenes recibidas a instancias de ProductImage y las asignamos al producto.
        //* Esto nos permite guardar las imágenes en la base de datos de manera independiente al producto.
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }

      //* Setea al usuario que creo el producto
      product.user = user;

      //* Guardamos el producto actualizado en la base de datos con el método save() del query runner.
      await queryRunner.manager.save(product);

      //* Confirmamos la transacción para aplicar los cambios en la base de datos. Si ocurre un error, se desharán los cambios.
      await queryRunner.commitTransaction();
      //* Finalizamos la transacción y cerramos la conexión con la base de datos.
      await queryRunner.release();

      //* Devolvemos el producto actualizado con las imágenes actualizadas.
      return this.findOnePlain(id);
    } catch (error) {
      //* Si ocurre un error, deshacemos la transacción y lanzamos una excepción. Los cambios realizados en la transacción se desharán.
      //* Esto es útil para evitar que se realicen cambios parciales en la base de datos si ocurre un error.
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    //* Buscamos un producto por su id con metodo findOne() ya creado por mí
    const product = await this.findOne(id);

    //* Eliminamos el producto de la base de datos
    await this.productRepository.remove(product);

    return product;
  }

  async deleteAllProducts() {
    //* Creamos una instancia de QueryBuilder para construir una consulta SQL de eliminación de todos los productos.
    const query = this.productRepository.createQueryBuilder('Product');

    try {
      //* Ejecutamos la consulta SQL de eliminación de todos los productos en la base de datos.
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
