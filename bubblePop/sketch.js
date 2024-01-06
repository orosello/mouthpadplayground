let bubbles = [];
let myFont;

function preload() {
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  let r = 100; // Bubble radius
  for (var i = 0; i < 8; i++) {
    let validPlacement = false;
    let x, y;
    while (!validPlacement) {
      x = random(r, width - r);
      y = random(r, height - r);
      validPlacement = true;

      // Check for overlap with other bubbles
      for (let j = 0; j < bubbles.length; j++) {
        let other = bubbles[j];
        let d = dist(x, y, other.x, other.y);
        if (d < r + other.r) {
          validPlacement = false;
          break;
        }
      }
    }
    bubbles[i] = new Bubble(x, y, r);
  }

  textFont(myFont);
  textSize(16);
  textAlign(CENTER);
}

function doubleClicked() {
  for (var i = bubbles.length - 1; i >= 0; i--) {
    if (bubbles[i].isHovered()) {
      bubbles.splice(i, 1);
    }
  }

  // Check if all bubbles are popped
  if (bubbles.length === 0) {
    window.location.href = "../index.html"; // Navigate back to the main menu
  }
}

function draw() {
  background(0);

  for (var i = 0; i < bubbles.length; i++) {
    bubbles[i].move();
    bubbles[i].show();
    //check if mouse is over the bubble
    if (bubbles[i].isHovered() && !bubbles[i].hovered) {
      bubbles[i].hovered = true;
    } else if (!bubbles[i].isHovered()) {
      bubbles[i].hovered = false;
    }
  }

  // Reset stroke and fill settings
  noStroke();
  fill(0);

  // Draw a black rectangle behind the text
  // rect(windowWidth / 2 - 75, windowHeight - 70, 150, 30);

  rectMode(CENTER);
  rect(windowWidth / 2, windowHeight - 60, 550, 30);

  // Draw the text on top of the rectangle
  fill(255);
  text(
    "Double click on a bubble to pop it",
    windowWidth / 2,
    windowHeight - 50
  );
}

class Bubble {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.hovered = false;
  }

  move() {
    this.x = this.x + random(-1, 1);
    this.y = this.y + random(-1, 1);
  }

  show() {
    noStroke();
    if (this.isHovered()) {
      fill(0); // Change color to red when hovered
      strokeWeight(2);
      stroke(255);
    } else {
      fill(255); // Original color when not hovered
    }
    circle(this.x, this.y, this.r);
  }

  isHovered() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    return d < this.r;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
