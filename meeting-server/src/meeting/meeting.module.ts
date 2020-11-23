import { forwardRef, Module } from '@nestjs/common';
import { MeetingGateway } from './meeting.gateway';
import { MessageService } from './services/message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './models/message.entity';
import { RoomEntity } from './models/room.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MeetingController } from './controllers/meeting.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserRepository } from 'src/auth/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity, RoomEntity,UserRepository]),
    forwardRef(() => AuthModule),
    JwtModule.register({
      secret: 'asdfsecret',
      signOptions: {
        expiresIn: 3600,
      },
    }),
  ],
  providers: [MeetingGateway, MessageService],
  controllers: [MeetingController],
})
export class MeetingModule {}
