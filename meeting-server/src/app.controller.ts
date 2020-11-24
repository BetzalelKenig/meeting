import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import * as path from 'path';

@Controller('meeting')
export class AppController {
  constructor(private readonly appService: AppService) { }

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }

  @Get()
  root(@Res() response): void {
    // the homepage will load our index.html which contains angular logic
    response.sendFile(__dirname + '/public/index.html');
  }
}
