import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isAuthenticated = false;
  private userSub: Subscription;

  constructor() { }

  ngOnInit(): void {
  }

  onLogout() {
   // this.authService.logout();
  }

  ngOnDestroy() {
  //  this.userSub.unsubscribe();
  }

}
