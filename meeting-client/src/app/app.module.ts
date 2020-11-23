import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { HomeComponent } from './home/home.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptorService } from './auth/auth.interseptor.service';


@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    BrowserModule, 
    AppRoutingModule, 
    SharedModule, 
    HttpClientModule],

  bootstrap: [AppComponent],
})
export class AppModule { }

// providers: [
//   {
//   provide: HTTP_INTERCEPTORS,
//   useClass: AuthInterceptorService,
//   multi: true,
// },
// ],
