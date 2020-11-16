import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3001)
export class MeetingGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  // server for send the massage to averyone
  @WebSocketServer() wss: Server;

  handleConnection(client: any, ...args: any[]) {
    console.log('connection');
  }

  handleDisconnect(client: any) {
    console.log('disconnected');
  }
  // get the coordinates from client and emit them to the others
  @SubscribeMessage('draw-coordinates')
  handleDraw(client: any, payload: any): any {
    // send to others
    this.wss.emit('draw-this', payload);
  }

  @SubscribeMessage('clear')
  handleClear(client: any, payload: any): any {
    // clear others
    this.wss.emit('clear-board');
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    client: Socket,
    message: { room: string; date: string; sender: string; message: string },
  ) {
    console.log(message);

    this.wss.to(message.room).emit('chatToClient', message);
  }

  @SubscribeMessage('joinRoom')
  handleRoomJoin(client: Socket, room: string) {
    client.join(room);
    this.wss.to(room).emit('joinedRoom', room);
  }

  @SubscribeMessage('leaveRoom')
  handleRoomLeave(client: Socket, room: string) {
    client.leave(room);
    this.wss.to(room).emit('leftRoom', room);
  }
}
