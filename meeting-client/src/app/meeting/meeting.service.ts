import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  socket = io('http://localhost:3001');
  username = 'Aly'
  room = '';
  participants = [this.username]
  constructor() { }

  joinRoom(room: string) {
    this.room = room;
    
    this.socket.emit('joinRoom', {room:room, username:this.username});
  }

  leaveRoom(room: string) {
    this.socket.emit('joinRoom', {room:room, username:this.username});
    this.room = '';
    
  }
}
