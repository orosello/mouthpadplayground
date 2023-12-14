let circleRadius = 40;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Bubble{

  constructor(x, y, r){
    this.x = x;
    this.y = y;
    this.r = r;
  }

  show(){
    fill
    circle(this.x, this.y, this.r);

  }



}


