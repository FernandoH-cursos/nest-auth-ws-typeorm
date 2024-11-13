import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';

import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtPayload } from 'src/auth/interfaces';

import { Server, Socket } from 'socket.io';

//* @WebSocketGateway() es un gateway de websockets que se encarga de manejar las conexiones de los clientes y los eventos que se emiten
//* desde el servidor hacia los clientes. Su propiedad {cors: true} permite que cualquier cliente pueda conectarse al servidor de
//* websockets. La propiedad 'namespace' permite definir un espacio de nombres para el gateway de websockets, lo cual es útil para
//* organizar los eventos y las conexiones de los clientes en diferentes espacios de nombres. Por defecto, el espacio de nombres es
//* '/', lo cual significa que todos los eventos y las conexiones de los clientes se manejan en el mismo espacio de nombres. Para
//* definir un espacio de nombres personalizado, se debe especificar la propiedad 'namespace' con el nombre del espacio de nombres
//* deseado. Por ejemplo, si se desea crear un espacio de nombres llamado 'chat', se debe definir el espacio de nombres de la
//* siguiente manera: @WebSocketGateway({ namespace: 'chat' }).

//* La interfaz OnGatewayConnection define un método handleConnection() que se ejecuta cada vez que un cliente se conecta al servidor
//* de websockets. La interfaz OnGatewayDisconnect define un método handleDisconnect() que se ejecuta cada vez que un cliente se
//* desconecta del servidor de websockets. Ambos métodos reciben como argumento un objeto Socket que representa al cliente que se
//* conecta o se desconecta del servidor de websockets. El objeto Socket contiene información sobre el cliente, como su identificador
//* único, su dirección IP, y otros datos relacionados con la conexión del cliente al servidor de websockets. En este caso, se
//* implementan los métodos handleConnection() y handleDisconnect() para imprimir un mensaje en la consola cada vez que un cliente se
//* conecta o se desconecta del servidor de websockets.

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  //* @WebSocketServer() es un decorador que inyecta el servidor de websockets en el gateway de websockets. El servidor de websockets
  //* es un objeto que se encarga de manejar las conexiones de los clientes y los eventos que se emiten desde el servidor hacia los
  //* clientes. El servidor de websockets se utiliza para enviar mensajes a los clientes conectados al servidor de websockets y para
  //* recibir mensajes de los clientes.
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    // console.log(client);
    // console.log('Client connected:', client.id);

    //* Guardar el token de autenticación del cliente en una variable token. El token de autenticación se obtiene del objeto client
    //* que representa al cliente que se conecta al servidor de websockets.
    const token = client.handshake.headers.authentication as string;
    // console.log({ token });
    let payload: JwtPayload;

    try {
      //* Verificar si el token de autenticación es válido. Si el token de autenticación es válido, se decodifica el token y se guarda
      //* la información del usuario en la variable payload.
      payload = this.jwtService.verify(token);

      //* Registrar al cliente en el servicio de mensajes WS cuando se conecta al servidor de websockets.
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      //* Si el token de autenticación no es válido, se desconecta al cliente del servidor de websockets y se imprime un mensaje de error
      client.disconnect();
      return;
    }
    // console.log({ payload });

    //* Emitir un evento 'clients-updated' a todos los clientes conectados al servidor de websockets cada vez que un cliente se conecta
    //* o se desconecta del servidor de websockets. El evento 'clients-updated' envía un mensaje con la lista de clientes conectados al
    //* servidor de websockets, la cual se obtiene a través del método getConnectedClients() del servicio MessagesWsService. El método
    //* getConnectedClients() devuelve un array con los identificadores únicos de los clientes conectados al servidor de websockets.
    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  handleDisconnect(client: Socket) {
    // console.log('Client disconnected:', client.id);
    this.messagesWsService.removeClient(client);
  }

  //* @SubscribeMessage() es un decorador que se utiliza para definir un método que maneja un evento específico que se emite desde el
  //* cliente hacia el servidor de websockets. El decorador @SubscribeMessage() recibe como argumento el nombre del evento que se desea
  //* manejar. En este caso, el método handleMessageFromClient() maneja el evento 'message-from-client' que se emite desde el cliente
  //* hacia el servidor de websockets. El método handleMessageFromClient() recibe como argumento un objeto client de tipo Socket que
  //* representa al cliente que emite el evento, y un objeto payload que contiene los datos enviados por el cliente.
  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    // console.log({ clientId: client.id, message: payload });
    //* Emitir un evento 'message-from-server' a todos los clientes conectados al servidor de websockets cada vez que un cliente envía
    //* un mensaje al servidor de websockets. El evento 'message-from-server' envía un mensaje con el nombre completo del cliente que ha
    //* enviado el mensaje y el contenido del mensaje. El nombre completo del cliente se obtiene del objeto payload que contiene los
    //* datos enviados por el cliente.

    //? Si se usa 'client.emit()' se envía el mensaje solo al cliente que lo envió.
    //? Si se usa 'client.broadcast.emit()' se envía el mensaje a todos los clientes conectados menos al que lo envió.
    //? Si se usa 'this.wss.emit()' se envía el mensaje a todos los clientes conectados.
    /* client.emit('message-from-server', {
      fullName: 'Soy yo!',
      message: payload.message || 'no-message!!',
    }); */

    /* client.broadcast.emit('message-from-server', {
      fullName: 'Soy yo!',
      message: payload.message || 'no-message!!',
    }); */

    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no-message!!',
    });
  }
}
