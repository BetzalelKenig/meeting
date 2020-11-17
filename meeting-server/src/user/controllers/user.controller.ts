import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.interface';
import { catchError, map } from 'rxjs/operators';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() user: User): Observable<User| Object> {
    return this.userService.create(user).pipe(
        map((user: User)=>user),
        catchError(err => of({error: err.message}))
    );
  }

  @Post('login')
  login(@Body()user: User): Observable<Object>{
    return this.userService.login(user).pipe(
        map((jwt: string)=> {
            return {name: user.username, token: jwt, expiresIn: 'asdf'}
        })
    )
    
    
  }

  @Get(':id')
  findOne(@Param() params): Observable<User> {
    return this.userService.findOne(params.id);
  }

  @Get()
  findAll(): Observable<User[]> {
    return this.userService.findAll();
  }

  @Delete(':id')
  deleteOne(@Param('id') id: string): Observable<any> {
    return this.userService.deleteOne(+id);
  }

  @Put(':id')
  updateOne(@Param('id') id: string, @Body() user: User): Observable<any> {
    return this.userService.updateOne(+id, user);
  }
}
