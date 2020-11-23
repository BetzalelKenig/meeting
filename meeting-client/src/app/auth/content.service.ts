import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from './user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  user = new BehaviorSubject<User>(null);

  constructor(private authService: AuthService) {
    this.authService.user.subscribe(user => {
      this.user.next(user)
    })
  }

}
