import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { MeetingService } from '../meeting.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  public isNewRoomCollapsed = true;
  public isJoinRoomCollapsed = true;
  username;
  inRoom = '';
  @Output() room = new EventEmitter<string>();
  socket;
  private chat: ElementRef;
  allRooms;

  @ViewChild('chat', { static: false }) set content(content: ElementRef) {
    if (content) {
      // initially setter gets called with undefined
      this.chat = content;
    }
  }
  messages = [];

  defaultRoom = 'Public Room';

  constructor(
    private meetingService: MeetingService,
    private authService: AuthService
  ) { }



  ngOnInit(): void {
    this.meetingService.socketChanged.subscribe(socket => {
      this.socket = socket;
    })


    //this.allRooms = this.meetingService.allRooms;

    this.meetingService.allRooms.subscribe((rooms: string[]) => {
      this.allRooms = rooms;
    })


    this.meetingService.messages.subscribe((m: []) => {
      this.messages = m;
    });

    this.authService.user.subscribe((user) => {
      if (user) {
        this.username = user.name;
      }
    });
  }

  scrollToBottom(): void {
    if (this.chat != undefined)
      this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
  }
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  joinRoom(form: NgForm) {

    // get the room name after login to room
    this.meetingService.roomName.subscribe(room => {
      this.inRoom = room;
    })

    this.room.emit(this.inRoom);
    this.meetingService.joinRoom(form.value.room, form.value.roompassord);

    this.socket.on('errors', (error => {
      console.log(error);

    }))


    this.socket.on('chatToClient', (messageData) => {
      if (messageData.error) { }
      const { room, ...data } = messageData;

      this.rightMessage(data.date, data.sender, data.message);
    });
  }

  addRoom(roomForm: NgForm) {
    if (roomForm.value.password !== roomForm.value.verifypass) {
      console.log(roomForm.value.password, '!==', roomForm.value.verify);

    } else {
      this.inRoom = roomForm.value.name;
      this.room.emit(this.inRoom);
      this.meetingService.addRoom(this.inRoom, roomForm.value.password);

      this.socket.on('chatToClient', (messageData) => {
        if (messageData.error) { }
        const { room, ...data } = messageData;
        this.rightMessage(data.date, data.sender, data.message);
      });
    }
  }

  leaveRoom() {
    this.meetingService.leaveRoom(this.inRoom);
    this.inRoom = '';
    this.messages = [];
  }

  sendMessage(messageForm: NgForm) {
    const { name } = JSON.parse(localStorage.getItem('userData'));
    let messageData = {
      date: new Date(),
      sender: name,
      message: messageForm.value.message,
    };
    console.log(messageData);

    messageForm.reset();
    this.socket.emit('sendMessage', { room: this.inRoom, ...messageData });
  }

  rightMessage(date, sender, message) {
    let messageData = {
      date: new Date(date),
      sender: sender,
      message: message,
    };
    this.messages.push(messageData);
    this.scrollToBottom();
  }

  // Todo allow user to enter in new line
  handleEnter(evt) {
    if (evt.keyCode == 13 && evt.shiftKey) {
      if (evt.type == 'keypress') {
        //pasteIntoInput(this, "\n");
      }
    }
  }

  deleteMessage(id: number) {
    this.meetingService.deleteMessgae(id);

  }



  showPss() { }

  ngOnDestroy(): void {
    // check what if inRoom == undefine ???
    this.leaveRoom();
  }
}
