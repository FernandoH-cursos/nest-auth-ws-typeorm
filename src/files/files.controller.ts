import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { FilesService } from './files.service';

import { fileFilter, fileNamer } from './helpers';

import { diskStorage } from 'multer';
import { Response } from 'express';

//* 'Express.Multer.File' es un tipo de dato que nos proporciona multer para poder trabajar con los archivos que se suben al servidor.

//* @UseInterceptors() es un decorador que nos permite aplicar interceptores a los métodos de un controlador. En este caso, estamos
//* aplicando el interceptor 'FileInterceptor' al método 'uploadProductImage'.

//* Un interceptor es un tipo de middleware que se ejecuta antes o después de que un controlador maneje una solicitud. En este caso,
//* el interceptor 'FileInterceptor' nos permite manejar archivos que se suben al servidor.

//* FileInterceptor es un interceptor que nos permite subir archivos al servidor. Recibe como argumento el nombre del campo del formulario
//* que contiene el archivo que queremos subir. En este caso, el campo del formulario se llama 'file'.
//* { fileFilter: fileFilter } es un objeto de configuración que le indica al interceptor que utilice la función 'fileFilter' para filtrar
//* los archivos que se suben al servidor (validar). La función 'fileFilter' se encarga de validar si un archivo es aceptado o no.
//* { storage: diskStorage({ destination: './static/uploads' }) } es un objeto de configuración que le indica al interceptor que guarde
//* los archivos en el directorio './static/uploads'. La función 'diskStorage' es un método de multer que nos permite guardar los archivos
//* en el sistema de archivos del servidor. 'filename: fileNamer' es una función que se encarga de generar un nombre único para el archivo
//* que se sube al servidor.

//* @UploadedFile() es un decorador que nos permite acceder al archivo subido en el método del controlador.

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {
    const path = this.filesService.getStaticProductImage(imageName);

    //* Permite mostrar la imagen desde el servidor.
    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    //* Si no se especifica un archivo imagen en la solicitud, lanzamos una excepción BadRequestException.
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

    return {
      secureUrl,
    };
  }
}
