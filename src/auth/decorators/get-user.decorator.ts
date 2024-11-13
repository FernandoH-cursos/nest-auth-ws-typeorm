import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

//* 'createParamDecorator()' es un método de NestJS que nos permite crear decoradores personalizados para obtener datos de la petición.
//* En este caso, estamos creando un decorador que nos permite obtener el usuario autenticado en la ruta.

//* data: any es un parámetro opcional que podemos utilizar para recibir información adicional en el decorador.
//* En este caso, no lo estamos utilizando.

//* ctx: ExecutionContext es un objeto que contiene información sobre la petición actual. En este caso, estamos utilizando el método
//* 'switchToHttp()' para obtener el objeto 'Request' de Express. Luego, obtenemos el usuario autenticado de la petición y lo retornamos.
export const GetUser = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new InternalServerErrorException('User not found (request)');
    }

    //* Si 'data' tiene un valor, retornamos el campo específico del usuario. De lo contrario, retornamos el usuario completo.
    return data ? user[data] : user;
  },
);
