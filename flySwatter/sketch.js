let circleRadius = 20;
let b;
let bubbles = [];
let state = "bubbles"; // Add a state variable
let stateChangeTime;

function setup() {
  createCanvas(windowWidth, windowHeight);

  for (let i = 0; i < 20; i++) {
    let x = windowWidth / 2 + random(-100, 100);
    let y = windowHeight / 2 + random(-100, 100);
    let r = circleRadius;
    b = new Bubble(x, y, r);
    bubbles.push(b);
  }
}

function draw() {
  if (state === "bubbles") {
    background(0);

    for (let i = 0; i < bubbles.length; i++) {
      bubbles[i].move();
      bubbles[i].show();
    }

    if (bubbles.length === 0) {
      state = "animation";
      stateChangeTime = millis(); // Record the time when the state changes
    }
  } else if (state === "animation") {
    background("black");
    let gap = calculateSpacing(10);
    for (let i = 0; i <= width; i += gap) {
      for (let j = 0; j <= height; j += 50) {
        fill(random(0, 255), random(0, 255), random(0, 255));
        noStroke();
        circle(i, j, 50);
      }
    }

    if (millis() - stateChangeTime > 3000) {
      // If 3 seconds have passed
      state = "black";
    }
  } else if (state === "black") {
    background(0);
  }
}

function mousePressed() {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    if (bubbles[i].onHover()) {
      bubbles.splice(i, 1);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function calculateSpacing(ballNumber) {
  return width / ballNumber;
}

class Bubble {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
  }

  show() {
    if (this.onHover()) {
      fill(0);
      stroke(255);
    } else {
      fill(255);
      noStroke();
    }
    circle(this.x, this.y, this.r * 2);
  }

  move() {
    this.x = this.x + random(-4, 4);
    this.y = this.y + random(-4, 4);
  }

  onHover() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    return d < this.r;
  }
}
