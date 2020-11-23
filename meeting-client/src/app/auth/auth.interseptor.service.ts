import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpParams,
  HttpHeaders,
} from '@angular/common/http';
// import { AuthService } from './auth.service';
import { take, exhaustMap } from 'rxjs/operators';
import { ContentService } from './content.service';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private contentService: ContentService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.contentService.user.pipe(
      take(1),
      exhaustMap((user) => {
        if (!user) {
          return next.handle(req);
        }
        console.log(user.token);
        
        const modifiedReq = req.clone({
          headers: new HttpHeaders().set('authorization', 'Bearer '+user.token),
        });
        return next.handle(modifiedReq);
      })
    );
  }
}