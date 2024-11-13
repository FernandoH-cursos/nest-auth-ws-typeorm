import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

//* 'PassportModule' es un modulo de NestJS que nos permite implementar estrategias de autenticación en nuestra aplicación.
//* En este caso, vamos a utilizar la estrategia 'jwt' que nos permite autenticar a los usuarios mediante un token JWT.

//* 'JwtModule' es un modulo de NestJS que nos permite configurar la generación y validación de tokens JWT.
//* En este caso, vamos a configurar un seed secreto para firmar los tokens y una expiración de 2 horas.

//* 'registerAsync' nos permite configurar el modulo de forma asíncrona, inyectando el servicio de configuración. Esta usando varias
//* propiedades como 'imports' que es un array de modulos que se necesitan para la configuración, 'inject' que es un array de servicios
//* que se inyectan en la función 'useFactory' y 'useFactory' que es una función que retorna un objeto con la configuración del modulo.

//* JwtModule.register() es una forma de configurar el modulo de forma sincrona, pasando un objeto con la configuración del modulo.

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '2h' },
      }),
    }),
    /*  JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '2h' },
    }), */
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
