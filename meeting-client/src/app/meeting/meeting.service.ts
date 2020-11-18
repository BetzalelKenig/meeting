import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import * as io from 'socket.io-client';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  socket = io('http://localhost:3001');
  username: string;
  room = '';
  participants = [];
  participantsChanged = new BehaviorSubject<any>(this.username);
  constructor(private authService: AuthService) {
    this.authService.user.subscribe((u) => {
      this.username = u.name;
      this.participants.push(this.username);
    });
    this.socket.on('joinedRoom', (name: string) =>
      this.participants.push(name)
    );
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
