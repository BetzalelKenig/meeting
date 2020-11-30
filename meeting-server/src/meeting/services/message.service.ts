import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MessageEntity } from '../models/message.entity';
import { Repository } from 'typeorm';
import { Observable, from, throwError } from 'rxjs';
import { RoomEntity } from '../models/room.entity';

//import { AuthService } from 'src/auth/services/auth.service';
import { CreateRoomDto } from '../models/create-room.dto';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable()
export class MessageService {

  // Save active rooms with their participants
  // for sending the participants to new participant
  rooms = {};

  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
    
  ) { }

  createMessage(message: MessageEntity): Observable<MessageEntity> {
    return from(this.messageRepository.save(message));
  }

  async getRoomMessages(roomName: string) {
    return this.messageRepository.find({ room: roomName });
  }

  deleteMessage(id: number) {
    return this.messageRepository.delete(id);
  }

  joinRoom(roomName: string, password: string) {
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

        return throwError(err)
      }),

    );
  }

  addToParticipants(roomName: string, username) {
    // Add to participants if room allready active
    if (this.rooms[roomName]) {
      // Prevent duplicate participant in room
      if (!this.rooms[roomName].includes(username))
        this.rooms[roomName].push(username)
    } else { // Add the room ro active room white the first participant
      this.rooms[roomName] = [username]
    }
  }

  async findRoomByName(name: string) {

    let room = await this.roomRepository.findOne({ name: name })

    return this.roomRepository.findOne({ name: name });
  }

  getRooms() {
    return this.roomRepository.find();
  }

  async getRoomsNames() {
    let rooms = await this.getRooms();
    return rooms.map(room => room.name)
  }

  validateRoom(roomName: string, password: string) {
    return this.findRoomByName(roomName).then(room => {
      return room.password === password
    });
  }

}
