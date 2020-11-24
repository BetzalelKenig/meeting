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
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { UseGuards } from '@nestjs/common';
import { WsGuard } from './ws.guard';


@UseGuards(WsGuard)
@WebSocketGateway()
export class MeetingGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private messageService: MessageService) { }

  // server for send the massage to averyone
  @WebSocketServer() wss: Server;

  //@UseGuards(WsGuard)
  handleConnection(client: any, ...args: any[]) {
    console.log('connection');
  }

  handleDisconnect(client: any) {
    console.log('disconnected');
  }

  @SubscribeMessage('joinRoom')
  handleRoomJoin(client: Socket, payload) {

    this.messageService.validateRoom(payload.room, payload.password).then(c => {

      if (payload.password && payload.room && c === true) {
        client.join(payload.room);

        this.messageService.addToParticipants(payload.room, payload.username)

        this.messageService.getRoomMessages(payload.room).then(m => {
          client.emit('roomMessages', m);
        });
        this.wss
          .to(payload.room)
          .emit(
            'joinedRoom',
            payload.username,
            payload.room,
            this.messageService.rooms[payload.room],
          );
      } else {
        client.emit('errors', 'wrong password');
      }
    })


    // let clients = this.wss.sockets.adapter.rooms['Room Name'].sockets;
    // console.log(clients);
  }

  @SubscribeMessage('addRoom')
  handleNewRoom(client: Socket, payload) {


    // for error handling
    let res = this.messageService
      .addRoom({
        name: payload.room,
        creator: payload.username,
        password: payload.password,
      })
      .pipe(
        map(room => {
          client.join(payload.room);

          if (this.messageService.rooms[payload.room]) {
            // for case of join whitout leave

            if (
              !this.messageService.rooms[payload.room].includes(
                payload.username,
              )
            ) {

              this.messageService.rooms[payload.room].push(payload.username);
            }
          } else {
            this.messageService.rooms[payload.room] = [payload.username];


          }
          this.messageService.getRoomMessages(payload.room).then(m => {
            client.emit('roomMessages', m);
          });
          this.wss
            .to(payload.room)
            .emit(
              'joinedRoom',
              payload.username,
              this.messageService.rooms[payload.room],
            );
        }),
        catchError(err => {
          console.log(err);

          return of({ error: err.message })
        }),
      );
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
  handleMessage(client: Socket, message: MessageEntity) {
    this.messageService.createMessage(message);

    this.wss.to(message.room).emit('chatToClient', message);
  }

  @SubscribeMessage('deleteMessage')
  handleDeleteMessage(client: Socket, payload: { id: number, room: string }) {
    this.messageService.deleteMessage(payload.id);

    this.messageService.getRoomMessages(payload.room).then(m => {
      client.emit('roomMessages', m);
    });

  }



  @SubscribeMessage('leaveRoom')
  handleRoomLeave(client: Socket, payload) {
    client.leave(payload.room);

    if (this.messageService.rooms[payload.room])
      this.messageService.rooms[payload.room] = this.messageService.rooms[
        payload.room
      ].filter(name => name !== payload.username);

    this.wss
      .to(payload.room)
      .emit(
        'leftRoom',
        payload.username,
        this.messageService.rooms[payload.room],
      );
  }
}
