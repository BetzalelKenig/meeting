import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MeetingRoutingModule } from './meeting-routing.module';
import { MeetingComponent } from './meeting.component';
import { WhiteboardComponent } from './whiteboard/whiteboard.component';
import { ChatComponent } from './chat/chat.component';

@NgModule({
  declarations: [MeetingComponent, WhiteboardComponent, ChatComponent],
  imports: [CommonModule, MeetingRoutingModule, FormsModule],
})
export class MeetingModule {}
