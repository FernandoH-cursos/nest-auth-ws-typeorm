import { BadRequestException, Injectable } from '@nestjs/common';

import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class FilesService {
  getStaticProductImage(imageName: string) {
    //* Guardamos la ruta de la imagen en una variable.
    const path = join(__dirname, '../../static/products', imageName);

    //* Si la imagen no existe en el directorio, lanzamos una excepción BadRequestException.
    if (!existsSync(path)) {
      throw new BadRequestException(
        `No product found with image '${imageName}'`,
      );
    }

    return path;
  }
}
