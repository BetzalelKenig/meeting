import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

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
  handleMessage(client: any, payload: any): any {
    
    // send to others
    this.wss.emit('draw-this', payload);
  }


  @SubscribeMessage('clear')
  handleClear(client: any, payload: any): any {
   
    // clear others
    this.wss.emit('clear-board');
  }
}


