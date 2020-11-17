import { Component, OnInit } from '@angular/core';
import { MeetingService } from './meeting.service';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.css']
})
export class MeetingComponent implements OnInit {
  participants;
  constructor(private meetingService: MeetingService) { }

  ngOnInit(): void {
    this.participants = this.meetingService.participants;
  }

}
