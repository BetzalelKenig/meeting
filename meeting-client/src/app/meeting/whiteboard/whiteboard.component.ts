import { Component, ElementRef, Input, OnInit, ViewChild, HostListener, AfterViewChecked } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { pairwise, switchMap, takeUntil, filter, take } from 'rxjs/operators';
import { Socket } from 'socket.io'
import { MeetingService } from '../meeting.service';

import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-whiteboard',
  templateUrl: './whiteboard.component.html',
  styleUrls: ['./whiteboard.component.css'],
})
export class WhiteboardComponent implements OnInit, AfterViewChecked {
  @ViewChild('canvas', { static: true }) public canvas: ElementRef;
  @ViewChild('bgColor', { static: true }) public bgColor: ElementRef;
  @ViewChild('inp', { static: true }) public inp: ElementRef;

  public width = window.innerWidth * 0.55;
  public height = window.innerHeight * 0.75;

  @Input() markerColor = '#0000ff';
  @Input() size = 5;
  @Input() bg = '#00ffff';
  socket;
  public ctx: CanvasRenderingContext2D;
  canvasEl: HTMLCanvasElement;
  subscription = Subscription;
  roomName;
  src;//for image upload
  img;
  constructor(private meetingService: MeetingService) { }

  ngOnInit(): void {

    this.meetingService.roomName.subscribe(room => {
      this.roomName = room;
    })

    this.meetingService.socketChanged.pipe(filter((socket: any) => socket != undefined), take(1)).subscribe((socket: Socket) => {
      if (socket) {
        this.socket = socket;

        this.socket.on(
          'draw-this',
          function (data) {


            this.drawOnCanvas(data.prevPos, data.currentPos, data.color, data.size);
          }.bind(this)
        );
        this.socket.on(
          'clear-board',
          function () {

            this.clearMe();
          }.bind(this)
        );
      }

    })
  }




  ngAfterViewChecked(): void {
    this.ctx.lineWidth = this.size;
  }



  resizeForChat(w) {
    this.canvasEl.width = w;
  }
  // //reset the canvas when resize
  // @HostListener('window:resize')onResize(){
  //     const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
  //     this.ctx = canvasEl.getContext('2d');

  //     canvasEl.width = window.innerWidth * 0.71;
  //     canvasEl.height = window.innerHeight * 0.78;
  // }




  public ngAfterViewInit() {
    this.canvasEl = this.canvas.nativeElement;
    this.ctx = this.canvasEl.getContext('2d');

    this.canvasEl.width = this.width;
    this.canvasEl.height = this.height;
    //canvasEl.style.margin = "10px";
    //this.canvasEl.style.background = this.bg; //this.bgColor.nativeElement.value;

    this.ctx.lineWidth = this.size;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#00ffff';
    this.ctx.fillStyle = "#00ffff";
    this.ctx.fillRect(0, 0, this.width, this.height);
    //this.image = this.canvas.nativeElement.toDataURL('image/png');
    this.captureEvents(this.canvasEl);



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
          room: this.roomName,
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
        if (this.socket) {
          this.socket.emit('draw-coordinates', {
            room: this.roomName,
            prevPos: prevPos,
            currentPos: currentPos,
            color: this.markerColor,
            size: this.size,
          });
        }
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
    this.ctx.beginPath();
    if (prevPos) {
      this.ctx.moveTo(prevPos.x, prevPos.y);
      this.ctx.lineTo(currentPos.x, currentPos.y);
      this.ctx.stroke();
    }
    this.ctx.strokeStyle = this.markerColor;
  }

  public drawLine() {

    let startPosition = { x: 0, y: 0 };
    let lineCoordinates = { x: 0, y: 0 };
    let isDrawStart = false;

    const getClientOffset = (event) => {
      const { pageX, pageY } = event.touches ? event.touches[0] : event;
      const x = pageX - this.canvasEl.offsetLeft;
      const y = pageY - this.canvasEl.offsetTop;
      return {
        x,
        y
      }
    }
    const drawLine = () => {
      this.ctx.beginPath();
      this.ctx.moveTo(startPosition.x, startPosition.y);
      this.ctx.lineTo(lineCoordinates.x, lineCoordinates.y);
      this.ctx.stroke();
    }

    const mouseDownListener = (event) => {
      startPosition = getClientOffset(event);
      isDrawStart = true;
    }

    const mouseMoveListener = (event) => {
      if (!isDrawStart) return;

      lineCoordinates = getClientOffset(event);
      //clearCanvas();
      this.ctx.clearRect(lineCoordinates.x, lineCoordinates.y, startPosition.x, startPosition.y);
      drawLine();
    }

    // var points = [];
    // points.push({
    //   x: x,
    //   y: y
    // });

    // canvas.clearRect(width, height);
    // points.forEach(function(point, i) {
    //   i === 0 ? canvas.moveTo(point.x, point.y) : canvas.lineTo(point.x, point.y);
    // });
    // canvas.stroke();

    const mouseupListener = (event) => {
      isDrawStart = false;
    }


    this.canvasEl.addEventListener('mousedown', mouseDownListener);
    this.canvasEl.addEventListener('mousemove', mouseMoveListener);
    this.canvasEl.addEventListener('mouseup', mouseupListener);

    this.canvasEl.addEventListener('touchstart', mouseDownListener);
    this.canvasEl.addEventListener('touchmove', mouseMoveListener);
    this.canvasEl.addEventListener('touchend', mouseupListener);

    /**
        var line, isDown;
    
    this.canvasEl.on('mouse:down', function(o){
      var canvas = new fabric.Canvas('c', { selection: false });
      isDown = true;
      var pointer = this.canvasEl.getPointer(o.e);
      var points = [ pointer.x, pointer.y, pointer.x, pointer.y ];
      line = new fabric.Line(points, {
        strokeWidth: 5,
        fill: 'red',
        stroke: 'red',
        originX: 'center',
        originY: 'center'
      });
      this.canvasEl.add(line);
    });
    
    this.canvasEl.on('mouse:move', function(o){
      if (!isDown) return;
      var pointer = this.canvasEl.getPointer(o.e);
      line.set({ x2: pointer.x, y2: pointer.y });
      this.canvasEl.renderAll();
    });
    
    this.canvasEl.on('mouse:up', function(o){
      isDown = false;
    }); */
  }
  // turn the color to background color
  eraser() {
    this.markerColor = this.bg;
  }
  // turn the color to blue after erase
  draw(jscolor) {
    this.markerColor = '#0000ff';
    if (this.markerColor == undefined) {
      this.markerColor = '#000000';
    }
  }
  /**Save the canvas as image 
   * Todo: let the user choose the name
   */
  saveImage() {
    this.canvas.nativeElement.toBlob((blob) =>
      FileSaver.saveAs(blob, 'canvas-image.png')
    );
  }

  uploadimg() {
    const base_image = new Image();
    
    base_image.src = URL.createObjectURL(this.inp.nativeElement.files[0]);
    base_image.onload =  ()=> {
      this.ctx.drawImage(base_image, this.width/4, this.height/4);
     // let dataUrl = canvas.toDataURL('image/jpeg');
    }
  }



  //    handleImage(e){
  //     var reader = new FileReader();
  //     reader.onload = function(event){
  //         var img = new Image();
  //         img.onload = function(){
  //             canvas.width = img.width;
  //             canvas.height = img.height;
  //             ctx.drawImage(img,0,0);
  //         }
  //         img.src = event.target.result;
  //     }
  //     reader.readAsDataURL(e.target.files[0]);     
  // }

  // clear the canvas and emit to the room
  clear() {
    this.clearMe()
    if (this.socket) {

      this.socket.emit('clear', this.roomName);
    }
  }

  // clear the canvas by draw background
  clearMe() {
    this.ctx.fillStyle = "#00ffff";
    this.ctx.fillRect(0, 0, this.width, this.height);

  }



}

// document.getElementById('inp').onchange = function(e) {
//   var img = new Image();
//   img.onload = draw;
//   img.onerror = failed;
//   img.src = URL.createObjectURL(this.files[0]);
// };
// function draw() {
//   var canvas = document.getElementById('canvas');
//   canvas.width = this.width;
//   canvas.height = this.height;
//   var ctx = canvas.getContext('2d');
//   ctx.drawImage(this, 0,0);
// }
// function failed() {
//   console.error("The provided file couldn't be loaded as an Image media");
// }










/**
 // let the user upload image to the canvas
 onChangeEvent(event: any) {

  this.img = new Image();
  this.img.onload = this.drawImage;
   this.img.onerror = failed;
  this.img.src = URL.createObjectURL(this.inp.nativeElement.files[0]);
 // this.src = this.img.src;
  console.log(this.ctx, '==========');
//  this.ctx.drawImage(this.img, 0, 0);
  function failed() {
    console.error("The provided file couldn't be loaded as an Image media");
  }
}

drawImage(img) {
  //  let canvas = this.canvas.nativeElement;
  //  console.log(canvas,'==========draw image');
  //  let ctx = canvas.getContext('2d');

  // canvas.width = this.width;
  // canvas.height = this.height;


  this.ctx.drawImage(img, 0, 0);
}*/
