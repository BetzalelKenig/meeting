import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MessageEntity } from '../models/message.entity';
import { Repository } from 'typeorm';
import { Observable, from, throwError } from 'rxjs';
import { RoomEntity } from '../models/room.entity';

import { AuthService } from 'src/auth/services/auth.service';
import { CreateRoomDto } from '../models/create-room.dto';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable()
export class MessageService {
  rooms = {};

  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
    private authService: AuthService,
  ) {}

  createMessage(message: MessageEntity): Observable<MessageEntity> {
    return from(this.messageRepository.save(message));
  }

  async getRoomMessages(roomName: string) {
    return this.messageRepository.find({ room: roomName });
  }

  deleteMessage(id: number) {
    return this.messageRepository.delete(id);
  }

  joinRoom(roomName: string, password: string){
    return this.validateRoom(roomName, password);
  }

  addRoom(room: CreateRoomDto): Observable<any> {
    

        const newRoom = new RoomEntity();
        newRoom.name = room.name;
        newRoom.creator = room.creator;
        newRoom.password = room.password;

        return from(this.roomRepository.save(newRoom)).pipe(
          map((room: RoomEntity) => {
            const { password, ...result } = room;
            return result;
          }),
          catchError(err => {
            console.log(err);
            
            return throwError(err)}),
       
    );
  }

  findRoomByName(name: string) {
    return this.roomRepository.findOne({ name });
  }

  getRooms() {
    return this.roomRepository.find();
  }

  async validateRoom(roomName: string, password: string) {
   let room = await this.findRoomByName(roomName);
   return room.password === password;
  }
}
