import { Component, OnInit, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MeetingService } from '../meeting.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  //username = JSON.parse(localStorage.getItem('userData'));
  @Input() inRoom = '';
  messages = [];
  participants=[];
  defaultRoom = 'Main Room'

  constructor(private meetingService: MeetingService) {}
  socket = this.meetingService.socket;

  ngOnInit(): void {
     this.meetingService.participantsChanged.subscribe(names=>{
     
       
      this.participants=names});
    this.socket.on('chatToClient', (messageData) => {
      const { room, ...data } = messageData;
      

      this.rightMessage(data.date, data.sender, data.message);
    });
  }

  joinRoom(form: NgForm) {
    console.log('joinRoom', form.value.room);
    this.inRoom = form.value.room;
    this.meetingService.joinRoom(this.inRoom);
  }

  leaveRoom() {
    this.inRoom = '';
    this.messages = [];
    
    this.meetingService.leaveRoom(this.inRoom);
  }


  sendMessage(messageForm: NgForm) {
    let { name } = JSON.parse(localStorage.getItem('userData'));
    let messageData = {
      date: new Date().toDateString(),
      sender: name,
      message: messageForm.value.message,
    };
messageForm.reset()
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

    // Todo allow user to enter in new line
   handleEnter(evt) {
    if (evt.keyCode == 13 && evt.shiftKey) {
      if (evt.type == "keypress") {
        //pasteIntoInput(this, "\n");
      }}}
}
