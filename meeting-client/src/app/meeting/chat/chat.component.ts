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

  ngOnInit(): void {}

  joinRoom(form: NgForm) {
    console.log('joinRoom', form.value.room);
    this.inRoom = form.value.room;
  }

  leaveRoom() {
    this.inRoom = '';
  }

  sendMessage(messageForm: NgForm) {
    this.messages.push({
      date: new Date().toDateString(),
      sender: this.username,
      message: messageForm.value.message,
    });
    messageForm.reset();
  }
}
