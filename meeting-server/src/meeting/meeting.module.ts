import { Module } from '@nestjs/common';
import { MeetingGateway } from './meeting.gateway';
import { MessageService } from './services/message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './models/message.entity';
import { RoomEntity } from './models/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity,RoomEntity])],
  providers: [MeetingGateway, MessageService]
})
export class MeetingModule {}
