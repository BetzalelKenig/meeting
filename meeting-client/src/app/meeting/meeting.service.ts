import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {

  userName: string;
  roomName = new BehaviorSubject('');
  roomname;//for send in delete
  messages = new Subject();
  private socket = null;
  socketChanged = new BehaviorSubject(null);
  participantsChanged = new Subject();
  allRooms = new Subject();
  socketOptions;
  token;



  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.authService.user.subscribe((u) => {
      if (u) {
        this.userName = u.name;
      }
    });

this.authService.user.subscribe(user=>{
  this.token = user.token;
})

    

    this.http.get('http://localhost:3000/meeting/rooms').subscribe(rooms => {
      this.allRooms.next(rooms);

    })

  }

  joinRoom(roomName: string, password: string) {

    this.roomname = roomName;

    this.listen();
    this.socket.emit('joinRoom', { room: roomName, password: password, username: this.userName });

  }

  addRoom(roomName: string, password: string) {
    this.listen();
    this.socket.emit('addRoom', { room: roomName, password: password, username: this.userName })

  }

  leaveRoom(room: string) {
    if (this.socket) {
      this.participantsChanged.next([]);
      this.socket.emit('leaveRoom', { room: room, username: this.userName });
      this.roomName.next('');
    }
  }

  listen() {
    this.socket = io('http://localhost:3001', {
      query: {
        auth: this.token
      }});
    this.socketChanged.next(this.socket)
    this.socket.on('joinedRoom', (name, room, participants) => {
      this.roomName.next(room);
      this.participantsChanged.next(participants);
    });

    this.socket.on('leftRoom', (name: string, participants) =>
    //this.participants.filter(participant => participant !== name)
    {
      this.participantsChanged.next(participants);
    }
    );

    this.socket.on('roomMessages', messages => {
      this.messages.next(messages);
    })
  }

  deleteMessgae(id: number) {

    this.socket.emit('deleteMessage', { id, room: this.roomname })
    // this.http.delete('http://localhost:3000/meeting/' + id).pipe(
    //   catchError(this.handleError)
    // ).subscribe();
  }

  handleError(errorRes: HttpErrorResponse) {
    console.log(errorRes, 'error http');

    return throwError('error ');
  }
}
