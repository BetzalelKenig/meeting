import { Component, OnInit, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MeetingService } from '../meeting.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  username = 'John';
  @Input() inRoom = '';
  messages = [{ date: '34 sun', sender: 'John', message: 'test message' }];
  participants = ['John', 'melculm'];

  constructor(private meetingService: MeetingService) {}
  socket = this.meetingService.socket;

  ngOnInit(): void {
    this.socket.on('chatToClient', (messageData) => {
      const { room, ...data } = messageData;
      console.log(data);

      this.rightMessage(data.date, data.sender, data.message);
    });
  }

  joinRoom(form: NgForm) {
    console.log('joinRoom', form.value.room);
    this.inRoom = form.value.room;
    this.socket.emit('joinRoom', this.inRoom);
  }

  leaveRoom() {
    this.inRoom = '';
    this.messages = [];
    this.participants = [];
  }

  sendMessage(messageForm: NgForm) {
    let messageData = {
      date: new Date().toDateString(),
      sender: this.username,
      message: messageForm.value.message,
    };

    this.socket.emit('sendMessage', { room: this.inRoom, ...messageData });
  }

  rightMessage(date, sender, message) {
    let messageData = {
      date: date,
      sender: sender,
      message: message,
    };
    this.messages.push(messageData);
  }
}
