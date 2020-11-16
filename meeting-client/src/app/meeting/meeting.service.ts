import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  socket = io('http://localhost:3001');
  constructor() { }
}
