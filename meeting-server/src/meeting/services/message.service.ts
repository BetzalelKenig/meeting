import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MessageEntity } from '../models/message.entity';
import { Repository } from 'typeorm';
import { Observable, from } from 'rxjs';

@Injectable()
export class MessageService {
  rooms = {};

  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  create(message: MessageEntity): Observable<MessageEntity> {
    return from(this.messageRepository.save(message));
  }

  async getRoomMessages(roomName: string) {
     
     return this.messageRepository.find({ room: roomName });

  }

  deleteMessage(id:number){}
}
