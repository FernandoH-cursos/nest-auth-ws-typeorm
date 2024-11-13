import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { IncomingHttpHeaders } from 'http';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { Auth, GetUser, RawHeaders, RoleProtected } from './decorators';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() createUserDto: LoginUserDto) {
    return this.authService.login(createUserDto);
  }

  @Get('ckeck-auth-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  //* 'AuthGuard' es un guardia de NestJS que nos permite proteger rutas de nuestra aplicación. En este caso, estamos protegiendo la ruta
  //* '/private' con el guardia 'AuthGuard' que valida que el token JWT sea válido.
  //* '@GetUser()' es un decorador personalizado que creamos y que nos permite obtener el usuario autenticado en la ruta.
  //* '@GetUser("email")' es una forma de obtener un campo específico del usuario autenticado. En este caso, estamos obteniendo el email.
  //* '@RawHeaders()' es un decorador personalizado que creamos y que nos permite obtener los headers de la petición HTTP.
  //* '@Headers()' es un decorador de NestJS que nos permite obtener los headers de la petición HTTP.
  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {
    return {
      ok: true,
      message: 'Hola mundo private!',
      user,
      userEmail,
      rawHeaders,
      headers,
    };
  }

  //* '@SetMetadata()' es un decorador de NestJS que nos permite definir metadatos en una ruta. En este caso, estamos definiendo los roles
  //* necesarios para acceder a la ruta '/private2'.
  //* '@RoleProtected()' es un decorador personalizado que creamos y que nos permite definir los roles necesarios para acceder a una ruta.
  //* Es una mejora del decorador '@SetMetadata()', ya que nos permite definir los roles necesarios de una forma más sencilla y legible.

  //* 'UserRoleGuard' es un guardia de NestJS que creamos y que nos permite validar si el usuario autenticado tiene los roles necesarios
  @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-user'])
  @RoleProtected(ValidRoles.ADMIN, ValidRoles.SUPER_USER)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  //* '@Auth()' es un decorador personalizado que creamos y que nos permite proteger rutas de nuestra aplicación. En este caso,
  //* estamos protegiendo la ruta '/private3' con los roles 'admin' y 'super-user'.
  @Get('private3')
  @Auth(ValidRoles.ADMIN, ValidRoles.SUPER_USER)
  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
}
