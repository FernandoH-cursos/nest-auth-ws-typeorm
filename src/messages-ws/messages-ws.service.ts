import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from 'src/auth/entities/user.entity';

import { Socket } from 'socket.io';
import { Repository } from 'typeorm';

//* {"id-socket": Socket, "id-socket2": Socket, ...}
interface ConnectedClients {
  [id: string]: {
    socket: Socket;
    user: User;
  };
}

@Injectable()
export class MessagesWsService {
  private connectedClients: ConnectedClients = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //* Verificar si un usuario ya está conectado al servicio de mensajes WS y si es así, desconectarlo antes de permitir
  //* que otro cliente se registre con el mismo usuario.
  private checkUserConnection(user: User) {
    //* Recorrer la lista de clientes conectados al servicio de mensajes WS
    for (const clientId of Object.keys(this.connectedClients)) {
      //* Obtener el cliente conectado a través de su id de socket
      const connectedClient = this.connectedClients[clientId];

      //* Si el usuario ya está conectado al servicio de mensajes WS, desconectarlo
      if (connectedClient.user.id === user.id) {
        connectedClient.socket.disconnect();
        break;
      }
    }
  }

  //* Permitir que un cliente se registre en el servicio de mensajes WS cuando se conecta
  async registerClient(client: Socket, userId: string) {
    //* Buscar el usuario en la base de datos a través de su id del token de autenticación
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User not active');

    //* Verificar si un usuario ya está conectado al servicio de mensajes WS y si es así, desconectarlo antes de permitir que
    //* otro cliente se registre con el mismo usuario.
    this.checkUserConnection(user);

    //* Guardar el cliente en el servicio de mensajes WS con su id como clave y su socket y usuario como valor
    this.connectedClients[client.id] = {
      socket: client,
      user: user,
    };
  }

  //* Permitir que un cliente se elimine del servicio de mensajes WS cuando se desconecta
  removeClient(client: Socket) {
    delete this.connectedClients[client.id];
  }

  //* Obtener el número de clientes conectados al servicio de mensajes WS
  getConnectedClients(): string[] {
    return Object.keys(this.connectedClients);
  }

  //* Obtener el nombre completo de un usuario a través de su id de socket
  getUserFullName(socketId: string) {
    return this.connectedClients[socketId].user.fullName;
  }
}
