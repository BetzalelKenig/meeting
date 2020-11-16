import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';



@NgModule({
  exports: [NavbarComponent, RouterModule],
  declarations: [NavbarComponent, LoadingSpinnerComponent],
  imports: [
    CommonModule,
    RouterModule
  ],
  
})
export class SharedModule { }
