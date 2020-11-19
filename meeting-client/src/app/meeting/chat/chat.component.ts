import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { MeetingService } from '../meeting.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  username;
  inRoom = '';
  @Output() room = new EventEmitter<string>();
  
  private chat: ElementRef;

  @ViewChild('chat', { static: false }) set content(content: ElementRef) {
    if (content) {
      // initially setter gets called with undefined
      this.chat = content;
    }
  }
  messages = [];

  defaultRoom = 'Main Room';

  constructor(private meetingService: MeetingService) {}
  socket = this.meetingService.socket;

  ngOnInit(): void {
    this.meetingService.messages.subscribe((m: []) => {
      this.messages.push(...m);
      console.log(this.messages);
    });

    this.socket.on('chatToClient', (messageData) => {
      const { room, ...data } = messageData;

      this.rightMessage(data.date, data.sender, data.message);
    });
  }

  scrollToBottom(): void {
    
if(this.chat != undefined)
    this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
  }
  ngAfterViewChecked() {
    
  }

  joinRoom(form: NgForm) {
    this.inRoom = form.value.room;
    this.room.emit(this.inRoom);
    this.meetingService.joinRoom(this.inRoom);
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
}
