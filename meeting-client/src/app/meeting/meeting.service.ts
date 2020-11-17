import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  socket = io('http://localhost:3001');
  username = JSON.parse(localStorage.getItem('userData')).name;
  room = '';
  participants = []
  participantsChanged = new BehaviorSubject<any>(this.username);

  constructor() {
    this.socket.on('joinedRoom', (name) =>{ 
      this.participants.push(name)
    this.participantsChanged.next(this.participants)
    });
    this.socket.on('leftRoom', (name) =>{ 
      this.participants.filter(p => p!==name)
    this.participantsChanged.next(this.participants)
    });
  }

  joinRoom(room: string) {
    this.room = room;

    this.socket.emit('joinRoom', { room: room, username: this.username });
  }

  leaveRoom(room: string) {
    this.socket.emit('leaveRoom', { room: room, username: this.username });
    this.room = '';
  }
}
