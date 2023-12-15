const circleRadius = 20;
const bubbles = [];
let state = "bubbles"; // Add a state variable
let stateChangeTime;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Disable right click context menu
  canvas.elt.oncontextmenu = function (e) {
    e.preventDefault();
  };

  for (let i = 0; i < 20; i++) {
    const x = windowWidth / 2 + random(-100, 100);
    const y = windowHeight / 2 + random(-100, 100);
    const r = circleRadius;
    const b = new Bubble(x, y, r);
    bubbles.push(b);
  }
}

function draw() {
  switch (state) {
    case "bubbles":
      background(0);
      bubbles.forEach((bubble) => {
        bubble.move();
        bubble.show();
      });

      if (bubbles.length === 0) {
        state = "animation";
        stateChangeTime = millis(); // Record the time when the state changes
      }
      break;
    case "animation":
      background("black");
      const gap = calculateSpacing(10);
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
      break;
    case "black":
      window.location.href = "../index.html";
      break;
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
    const d = dist(mouseX, mouseY, this.x, this.y);
    return d < this.r;
  }
}
