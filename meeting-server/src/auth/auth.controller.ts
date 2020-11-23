import { Body, Controller, Post, ValidationPipe, Get, UseGuards, Req } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtAuthGuard } from './jwt.guard';
import { Request } from 'express'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<{name:string, token: string, expiresIn:number }> {
    return this.authService.signUp(authCredentialsDto);
  }

  @Post('/signin')
  signIn(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<{name:string, token: string, expiresIn:number }> {
    return this.authService.signIn(authCredentialsDto);
  }


  // for test need to be in user controller for admin
  @UseGuards(JwtAuthGuard)
  @Get()
  getUsers(@Req() request: Request){
    return this.authService.getUsers();
  }
}
