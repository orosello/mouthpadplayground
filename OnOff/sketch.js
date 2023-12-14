let circleRadius = 20;
let bubble1;

function setup() {
  createCanvas(windowWidth, windowHeight);
  let x = windowWidth / 2;
  let y = windowHeight / 2;
  let r = circleRadius;
  bubble1 = new Bubble(x, y, r);
}

function draw() {
  background(0);
  bubble1.show();
}

function mousePressed() {
  bubble1.mouseIsPressed = true;
}

function mouseReleased() {
  bubble1.mouseIsPressed = false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Bubble {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.mouseIsPressed = false;
  }

  show() {
    if (this.mouseIsPressed) {
      fill(0);
      stroke(255);
    } else {
      fill(255);
      noStroke();
    }
    circle(this.x, this.y, this.r * 2);
  }
}
