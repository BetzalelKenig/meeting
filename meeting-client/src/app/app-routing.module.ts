import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth/auth-guard';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  {
    path: 'meeting',canActivate: [AuthGuard],
    loadChildren: () =>
      import('./meeting/meeting.module').then((m) => m.MeetingModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
