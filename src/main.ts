import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  //* 'new DocumentBuild()' permite configurar la documentación de Swagger. 'setTitle()' establece el título de la documentación,
  //* 'setDescription()' establece la descripción de la documentación, 'setVersion()' establece la versión de la documentación y
  //* 'build()' construye la documentación.
  const config = new DocumentBuilder()
    .setTitle('Teslo RESTFul API')
    .setDescription('Teslo shop endpoints')
    .setVersion('1.0')
    .build();

  //* 'SwaggerModule.createDocument()' crea la documentación de Swagger y 'SwaggerModule.setup()'
  //* establece la documentación en la ruta '/api'.
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT);
  logger.log(`App running on port ${process.env.PORT}`);
}
bootstrap();
