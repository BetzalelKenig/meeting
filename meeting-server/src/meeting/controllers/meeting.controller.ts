import { Controller, Get, Delete, Param } from '@nestjs/common';
import { MessageService } from '../services/message.service';


@Controller('meeting')
export class MeetingController {

    constructor(private messageService: MessageService) { }

    @Get('rooms')
    findAll() {
        return this.messageService.getRoomsNames()
    }

    @Delete(':id')
    deleteMessage(@Param('id') id: string){
        
        
        return this.messageService.deleteMessage(+id);
    }

}
