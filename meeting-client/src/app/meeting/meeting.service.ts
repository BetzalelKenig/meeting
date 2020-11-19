import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';
import { AuthService } from '../auth/auth.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
 
  userName: string;
  room = '';
  messages = new Subject();
  socket = io('http://localhost:3001');
  participantsChanged = new Subject();
  constructor(private authService: AuthService) {
    this.authService.user.subscribe((u) => {
      if (u) {
        this.userName = u.name;
      }
    });

  
  }

  joinRoom(room: string) {
    this.room = room;


    


    this.socket.on('joinedRoom', (name, participants) => {
      // this.participants = paticipants;
      this.participantsChanged.next(participants);
    });

    this.socket.on('leftRoom', (name: string, participants) =>
      //this.participants.filter(participant => participant !== name)
      {
        this.participantsChanged.next(participants);
      }
    );

    this.socket.on('roomMessages',messages =>{
      this.messages.next(messages);
      
      
    })

    this.socket.emit('joinRoom', { room: room, username: this.userName });
  }

  leaveRoom(room: string) {
    this.participantsChanged.next([]);
    this.socket.emit('leaveRoom', { room: room, username: this.userName });
    this.room = '';
  }
}
