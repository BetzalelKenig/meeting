import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth/auth-guard';
import { WhiteboardComponent } from './meeting/whiteboard/whiteboard.component';

const routes: Routes = [
  { path: '',redirectTo: 'home', pathMatch: 'full'},
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
  {path:'whiteboard',component: WhiteboardComponent},
  {path: '**', redirectTo: 'home'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
