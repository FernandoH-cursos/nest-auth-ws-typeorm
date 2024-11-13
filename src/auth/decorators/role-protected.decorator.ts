import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces';

//* 'RoleProtected' es un decorador personalizado que creamos y que nos permite definir los roles necesarios para acceder a una ruta.
//* 'SetMetadata()' es un decorador de NestJS que nos permite definir metadatos en una ruta. En este caso, estamos definiendo los roles
//* necesarios para acceder a la ruta.

export const META_ROLES = 'roles';

export const RoleProtected = (...roles: ValidRoles[]) => {
  return SetMetadata(META_ROLES, roles);
};
