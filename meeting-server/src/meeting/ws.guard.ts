import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { UserRepository } from 'src/auth/user.repository';

@Injectable()
export class WsGuard implements CanActivate {


  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) { }

  canActivate(
    context: any,
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {

    const request = context.switchToHttp().getRequest();
    const token = request.handshake.query.auth;

    try {
      const decoded = this.jwtService.verify(token, { secret: 'asdfsecret' }) as any;
      return new Promise((resolve, reject) => {
        return this.userRepository.findByUsername(decoded.username).then(user => {
          if (user) {
            resolve(user);
          } else {
            reject(false);
          }
        });

      });
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }
}



