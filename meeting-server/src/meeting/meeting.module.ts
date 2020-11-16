import { Module } from '@nestjs/common';
import { MeetingGateway } from './meeting.gateway';

@Module({
  providers: [MeetingGateway]
})
export class MeetingModule {}
