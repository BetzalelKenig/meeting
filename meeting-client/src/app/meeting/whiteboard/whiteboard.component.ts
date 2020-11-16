import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { pairwise, switchMap, takeUntil } from 'rxjs/operators';

import { MeetingService } from '../meeting.service';

@Component({
  selector: 'app-whiteboard',
  templateUrl: './whiteboard.component.html',
  styleUrls: ['./whiteboard.component.css'],
})
export class WhiteboardComponent implements OnInit {
  @ViewChild('canvas', { static: true }) public canvas: ElementRef;

  public width = window.innerWidth * 0.71;
  public height = window.innerHeight * 0.78;

  @Input() markerColor = '#ff0000';
  @Input() size = 3;
  @Input() bg = '#00ffff';

  public ctx: CanvasRenderingContext2D;

  constructor(private meetingService: MeetingService) {}
  socket = this.meetingService.socket;

  // reset the canvas when resize
  // @HostListener('window:resize')onResize(){
  //     const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
  //     this.ctx = canvasEl.getContext('2d');

  //     canvasEl.width = window.innerWidth * 0.71;
  //     canvasEl.height = window.innerHeight * 0.78;
  // }

  ngOnInit(): void {
    this.socket.on(
      'draw-this',
      function (data) {
        this.drawOnCanvas(data.prevPos, data.currentPos, data.color, data.size);
      }.bind(this)
    );
    this.socket.on(
      "clear-board",
      function () {
        this.clear();
      }.bind(this)
    );
  }

  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.ctx = canvasEl.getContext('2d');

    canvasEl.width = this.width;
    canvasEl.height = this.height;
    //canvasEl.style.margin = "10px";
    canvasEl.style.background = '#00ffff';

    this.ctx.lineWidth = this.size;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#000000';

    this.captureEvents(canvasEl);
  }

  private captureEvents(canvasEl: HTMLCanvasElement) {
    // this will capture all mousedown events from the canvas element
    fromEvent(canvasEl, 'touchstart')
      .pipe(
        switchMap((e) => {
          return fromEvent(canvasEl, 'touchmove').pipe(
            takeUntil(fromEvent(canvasEl, 'touchend')),
            pairwise()
          );
        })
      )
      .subscribe((res: [TouchEvent, TouchEvent]) => {
        const rect = canvasEl.getBoundingClientRect();

        // previous and current position with the offset
        const prevPos = {
          x: res[0].touches[0].clientX - rect.left,
          y: res[0].touches[0].clientY - rect.top,
        };

        const currentPos = {
          x: res[1].touches[0].clientX - rect.left,
          y: res[1].touches[0].clientY - rect.top,
        };

        // this method do the actual drawing
        this.drawOnCanvas(prevPos, currentPos, this.markerColor, this.size);
        this.socket.emit('draw-coordinates', {
          room: this.meetingService.room,
          prevPos: prevPos,
          currentPos: currentPos,
          color: this.markerColor,
          size: this.size,
        });
      });

    fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap((e) => {
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, 'mousemove').pipe(
            // we'll stop (and unsubscribe) once the user releases the mouse
            // this will trigger a 'mouseup' event
            takeUntil(fromEvent(canvasEl, 'mouseup')),
            // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
            takeUntil(fromEvent(canvasEl, 'mouseleave')),
            // pairwise lets us get the previous value to draw a line from
            // the previous point to the current point
            pairwise()
          );
        })
      )
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const rect = canvasEl.getBoundingClientRect();

        // previous and current position with the offset
        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top,
        };

        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top,
        };

        // this method do the actual drawing
        this.drawOnCanvas(prevPos, currentPos, this.markerColor, this.size);
        this.socket.emit('draw-coordinates', {
          room: this.meetingService.room,
          prevPos: prevPos,
          currentPos: currentPos,
          color: this.markerColor,
          size: this.size,
        });
      });
  }

  private drawOnCanvas(
    prevPos: { x: number; y: number },
    currentPos: { x: number; y: number },
    color,
    size
  ) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = size;
    if (!this.ctx) {
      return;
    }
    // console.log('draw on canvas func', color);

    this.ctx.beginPath();

    if (prevPos) {
      this.ctx.moveTo(prevPos.x, prevPos.y);
      this.ctx.lineTo(currentPos.x, currentPos.y);
      this.ctx.stroke();
    }

    this.ctx.strokeStyle = this.markerColor;
  }

  eraser() {
    this.markerColor = this.bg;
  }

  draw(jscolor) {
    this.markerColor = jscolor;
    if (this.markerColor == undefined) {
      this.markerColor = '#000000';
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.socket.emit( 'clear',this.meetingService.room);
  }

  
}
