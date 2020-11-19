import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './services/message.service';
import { MessageEntity } from './models/message.entity';
/**
 * move join and leave
 * to hadleConnection and disconnected
 * 
 * 
 * 
 */
@WebSocketGateway(3001)
export class MeetingGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private messageService: MessageService) {}

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
    // send to others in the room
    this.wss.to(payload.room).emit('draw-this', payload);
  }

  @SubscribeMessage('clear')
  handleClear(client: any, payload: any): any {
    // clear others
    client.broadcast.to(payload).emit('clear-board');
    
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    client: Socket,
    message: MessageEntity,
  ) {
    this.messageService.create(message)

    this.wss.to(message.room).emit('chatToClient', message);
  }

  @SubscribeMessage('joinRoom')
  handleRoomJoin(client: Socket, payload) {
    client.join(payload.room);
    
    
    if (this.messageService.rooms[payload.room]) {
      // for case of join whitout leave
      if(!this.messageService.rooms[payload.room].includes(payload.username)){

        this.messageService.rooms[payload.room].push(payload.username);
      }
    } else {
      this.messageService.rooms[payload.room] = [payload.username];
    }

    this.messageService.getRoomMessages(payload.room).then(m=>{
      client.emit('roomMessages',m)
      
    });
    
    
   
    
    
    this.wss.to(payload.room).emit('joinedRoom', payload.username,this.messageService.rooms[payload.room]);
  }

  @SubscribeMessage('leaveRoom')
  handleRoomLeave(client: Socket, payload) {
    client.leave(payload.room);
    
    this.messageService.rooms[payload.room] = this.messageService.rooms[payload.room].filter(name => name !== payload.username)
   
    
    this.wss.to(payload.room).emit('leftRoom', payload.username,this.messageService.rooms[payload.room]);
  }
}
