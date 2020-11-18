import { Module } from '@nestjs/common';
import { MeetingGateway } from './meeting.gateway';
import { MessageService } from './services/message.service';

@Module({
  providers: [MeetingGateway, MessageService]
})
export class MeetingModule {}
