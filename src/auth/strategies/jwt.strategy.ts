import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

//* 'Strategy' es una clase que nos permite implementar una estrategia de autenticación en NestJS.
//* 'JwtStrategy' es una clase que extiende de 'PassportStrategy' y que implementa la estrategia de autenticación 'jwt'.
//* super() recibe un objeto con la configuración de la estrategia, en este caso, el secreto para firmar los tokens y la forma
//* de extraer el token del request que es ExtractJwt.fromAuthHeaderAsBearerToken() que indica que el token se encuentra en el
//* header 'Authorization' con el prefijo 'Bearer'.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;

    //* Obteniendo usuario a partir de email del payload del token
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new UnauthorizedException('Token not valid');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive, talk with an admin');
    }

    return user;
  }
}
