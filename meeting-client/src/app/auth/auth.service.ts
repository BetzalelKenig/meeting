import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from './user.model';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface AuthResponseData {
  name: string;
  token: string;
  expiresIn: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  user = new BehaviorSubject<User>(null);
  rooms = new BehaviorSubject<string[]>(null);
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router) {
    // this.logUsers()
  }

  getRoomsName(){
    this.http.get('http://localhost:3000/meeting/rooms').subscribe((roomsName:string[]) => {
      this.rooms.next(roomsName);
    })
  }


  logUsers() {
    this.user.subscribe(user => {
      if (user) {
        console.log(user.token);

        this.http.get('http://localhost:3000/auth', { headers: { authorization: 'Bearer ' + user.token } }).subscribe(users => {
          console.log(users);
        })
      }
    })
  }


  signup(username: string, password: string) {
    return this.http
      .post<AuthResponseData>('http://localhost:3000/auth/signup', {
        username,
        password,
      })
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
          this.handleAuthentication(
            resData.name,
            resData.token,
            +resData.expiresIn
          );
          this.getRoomsName();
        })
      );
  }

  login(username: string, password: string) {
    return this.http
      .post<AuthResponseData>('http://localhost:3000/auth/signin', {
        username,
        password,
      })
      .pipe(
        catchError(this.handleError),
        tap((resData) => {
          this.handleAuthentication(
            resData.name,
            resData.token,
            +resData.expiresIn
          );
          this.getRoomsName();
        })
      );
  }

  autoLogin() {
    const userData: {
      name: string;
      access_token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));

    if (!userData) {
      return;
    }

    const loadedUser = new User(
      userData.name,
      userData.access_token,
      new Date(userData._tokenExpirationDate)
    );

    if (loadedUser.token) {
      this.user.next(loadedUser);
      this.getRoomsName();
      const expirationDuration =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number) {
    console.log("Expiration Duration: ", expirationDuration);
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(name: string, token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(name, token, expirationDate);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An error ocure!🙁';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    switch (errorRes.error.message) {
      case 'Invalid credentials':
        errorMessage = 'Invalid credentials⛔';
        break;
      case 'Username already exists':
        errorMessage = `This name is already exists.
      Please chose another nick name`;
        break;
    }
    return throwError(errorMessage);
  }
}
