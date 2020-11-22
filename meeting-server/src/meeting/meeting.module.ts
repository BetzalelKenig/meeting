import { forwardRef, Module } from '@nestjs/common';
import { MeetingGateway } from './meeting.gateway';
import { MessageService } from './services/message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './models/message.entity';
import { RoomEntity } from './models/room.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MeetingController } from './controllers/meeting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity, RoomEntity]), forwardRef(()=> AuthModule)],
  providers: [MeetingGateway, MessageService],
  controllers: [MeetingController],
})
export class MeetingModule {}
