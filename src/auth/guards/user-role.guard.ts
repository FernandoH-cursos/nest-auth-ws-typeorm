import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { META_ROLES } from '../decorators';

import { Observable } from 'rxjs';

//* 'reflector' es una instancia de la clase 'Reflector' que nos permite obtener metadatos de una ruta. En este caso, estamos obteniendo
//* los roles necesarios para acceder a la ruta.
@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    //* 'reflector.get()' es un método de la clase 'Reflector' que nos permite obtener metadatos de una ruta. En este caso,
    //* estamos obteniendo los roles necesarios para acceder a la ruta.
    const validRoles = this.reflector.get<string[]>(
      META_ROLES,
      context.getHandler(),
    );
    // console.log({ validRoles });
    if (!validRoles || validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new BadRequestException('User not found');
    // Agregar excepcion si usuario no cumple con los roles

    const hasRole = validRoles.some((role) => user.roles?.includes(role));
    if (!hasRole) {
      throw new ForbiddenException(
        `User ${user.fullName} need a valid role: ${validRoles}`,
      );
    }

    return hasRole;
  }
}
