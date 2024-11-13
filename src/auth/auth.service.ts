import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload';

import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    //* Si ocurre un error, lo mostramos en la consola y lanzamos una excepción
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  private getJwtToken(payload: JwtPayload) {
    //* 'sign()' es un método de 'JwtService' que nos permite firmar un objeto y generar un token JWT. La firma sirve para garantizar
    //* que el token no ha sido modificado y que fue generado por nuestra aplicación.
    const token = this.jwtService.sign(payload);

    return token;
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);
      delete user.password;

      return user;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    //* Buscamos un usuario por email y seleccionamos solo los campos id, email y password
    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true },
    });

    //* Validamos si el usuario existe con el email proporcionado
    if (!user) {
      throw new UnauthorizedException('Credentials are not valid (email)');
    }

    //* Validamos si la contraseña proporcionada coincide con la contraseña almacenada
    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credentials are not valid (password)');
    }

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }
}
