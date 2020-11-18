import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  socket = io('http://localhost:3001');
  userName: string;
  room = '';
  participants = [];
  constructor(private authService: AuthService) {
    this.authService.user.subscribe((u) => {
      this.userName = u.name;
      this.participants.push(this.userName);
    });
    this.socket.on('joinedRoom', (name: string) =>
      this.participants.push(name)
    );
  }

  joinRoom(room: string) {
    this.room = room;

    this.socket.emit('joinRoom', { room: room, username: this.userName });
  }

  leaveRoom(room: string) {
    this.socket.emit('joinRoom', { room: room, username: this.userName });
    this.room = '';
  }
}
