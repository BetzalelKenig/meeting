import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
 
  userName: string;
  roomName = '';
  messages = new Subject();
  private socket = null;
  socketChanged = new BehaviorSubject(null)
  participantsChanged = new Subject();
  constructor(private authService: AuthService) {
    this.authService.user.subscribe((u) => {
      if (u) {
        this.userName = u.name;
      }
    });

  
  }

  joinRoom(roomName: string,password: string) {
   
   
   
    this.roomName = roomName;

    this.listen();
    this.socket.emit('joinRoom', { room: roomName,password: password, username: this.userName });
  
  }

  addRoom(roomName: string, password: string){
    this.listen();
this.socket.emit('addRoom',{ room: roomName,password: password, username: this.userName })

  }

  leaveRoom(room: string) {
    this.participantsChanged.next([]);
    this.socket.emit('leaveRoom', { room: room, username: this.userName });
    this.roomName = '';
  }

  listen(){
    this.socket = io('http://localhost:3001');
   this.socketChanged.next(this.socket)
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
  }
}
