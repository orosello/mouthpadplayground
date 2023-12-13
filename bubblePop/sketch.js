let bubbles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  for (var i = 0; i < 100; i++) {
    let x = random(width);
    let y = random(height);
    let r = 40;
    bubbles[i] = new Bubble(x, y, r);
  }
}

function mousePressed() {
  for (var i = bubbles.length - 1; i >= 0; i--) {
    if (bubbles[i].isHovered()) {
      bubbles.splice(i, 1);
    }
  }
}

function draw() {
  background(0);

  for (var i = 0; i < bubbles.length; i++) {
    bubbles[i].move();
    bubbles[i].show();
    //chekc if mouse is over the bubble
    if (bubbles[i].isHovered() && !bubbles[i].hovered) {
      bubbles[i].hovered = true;
    } else if (!bubbles[i].isHovered()) {
      bubbles[i].hovered = false;
    }
  }
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
