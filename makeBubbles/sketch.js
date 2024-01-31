let bubbles = [];
let rightClick = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  bubble1 = new Bubble(windowWidth / 2, windowHeight / 2, 20);
  bubbles.push(bubble1);

  // Prevent context menu from showing up on right click
  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (mouseButton === RIGHT) {
    rightClick = true;
    for (let bubble of bubbles) {
      bubble.falling = true;
    }
  } else if (mouseButton === LEFT) {
    rightClick = false;
    let r = (0, 20);
    let b = new Bubble(mouseX, mouseY, r);
    bubbles.push(b);
  }
}

function draw() {
  background(0);

  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].move();
    bubbles[i].show();
    if (bubbles[i].y > height + bubbles[i].r) {
      bubbles.splice(i, 1);
    }
  }
  textAlign(CENTER, BOTTOM);
  text(
    "Click to make bubbles. Right click to drop them",
    width / 2,
    height - 20
  );
}

class Bubble {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.falling = false;
  }

  move() {
    if (this.falling) {
      this.y = this.y + 5;
    } else {
      this.x = this.x + random(-1, 1);
      this.y = this.y + random(-1, 1);
    }
  }

  show() {
    noStroke();
    fill(255);
    circle(this.x, this.y, this.r);
  }
}
