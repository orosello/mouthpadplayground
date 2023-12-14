let circleRadius = 20;
let bubble1;

let myFont;

function preload() {
  myFont = loadFont('../assets/Press_Start_2P/PressStart2P-Regular.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  let x = windowWidth / 2;
  let y = windowHeight / 2;
  let r = circleRadius;
  bubble1 = new Bubble(x, y, r);

  // Prevent the context menu from opening on right click
  canvas.oncontextmenu = function (e) {
    e.preventDefault();
  };

  textFont(myFont);
  textSize(16);
  textAlign(CENTER);
}

function draw() {
  background(0);
  bubble1.show();

  // Check for right mouse button here
  if (bubble1.mouseIsPressed && mouseButton === RIGHT) {
    noStroke();
    fill(255);
    text("Woops! That's a right click.", windowWidth / 2, windowHeight - 50);
  }
}

function mousePressed() {
  // Set mouseIsPressed to true for both left and right mouse buttons
  if (mouseButton === LEFT || mouseButton === RIGHT) {
    bubble1.mouseIsPressed = true;
  }
}

function mouseReleased() {
  // Set mouseIsPressed to false for both left and right mouse buttons
  if (mouseButton === LEFT || mouseButton === RIGHT) {
    bubble1.mouseIsPressed = false;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  bubble1.x = windowWidth / 2;
  bubble1.y = windowHeight / 2;
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

  // move() {
  //   if (this.mouseIsPressed) {
  //     this.x = this.x + random(-4, 4);
  //     this.y = this.y + random(-4, 4);
  //   }
  // }
}
