// Constants
const CIRCLE_RADIUS = 50;
const FONT_SIZE = 16;
const BOTTOM_TEXT_Y_OFFSET = 50;

// Variables
let bubble;
let myFont;
let moveCount = 1; // Changed this line

// Preload assets
function preload() {
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

// Setup the canvas and bubble
function setup() {
  createCanvas(windowWidth, windowHeight);
  bubble = new Bubble(windowWidth / 2, windowHeight / 2, CIRCLE_RADIUS);

  // Prevent the context menu from opening on right click
  canvas.oncontextmenu = (e) => e.preventDefault();

  // Set text properties
  textFont(myFont);
  textSize(FONT_SIZE);
  textAlign(CENTER);
}

// Draw the canvas and bubble
function draw() {
  background(0);
  bubble.show();

  noStroke();
  fill(255);
  if (moveCount === 1) {
    text(
      "Double click on the circle",
      windowWidth / 2,
      windowHeight - BOTTOM_TEXT_Y_OFFSET
    );
  } else if (moveCount === 2) {
    text(
      "Nice! Let's try it again",
      windowWidth / 2,
      windowHeight - BOTTOM_TEXT_Y_OFFSET
    );
  }
}

// Handle mouse press and release events
function mousePressed() {
  if ((mouseButton === LEFT || mouseButton === RIGHT) && bubble.isMouseInside())
    bubble.mouseIsPressed = true;
}

function mouseReleased() {
  if ((mouseButton === LEFT || mouseButton === RIGHT) && bubble.isMouseInside())
    bubble.mouseIsPressed = false;
}

// Handle mouse double click event
function doubleClicked() {
  bubble.checkMouseDoubleClick();
}

// Handle window resize event
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  bubble.setPosition(windowWidth / 2, windowHeight / 2);
}

// Bubble class
class Bubble {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.r = r;
    this.mouseIsPressed = false;
    this.lerpSpeed = 0.05;
    this.minLerpDistance = 1; // Minimum distance to consider lerping complete
    this.lastMoveTime = 0;
    this.moveCooldown = 200; // 200 milliseconds cooldown
  }

  show() {
    if (this.isMouseInside()) {
      stroke(255);
      strokeWeight(10);
    } else {
      noStroke();
    }
    fill(255); // Always fill with white

    // Update position with lerping
    let dx = this.targetX - this.x;
    let dy = this.targetY - this.y;
    if (abs(dx) > this.minLerpDistance || abs(dy) > this.minLerpDistance) {
      this.x += dx * this.lerpSpeed;
      this.y += dy * this.lerpSpeed;
    } else {
      // If we're close enough, snap to the target position
      this.x = this.targetX;
      this.y = this.targetY;
    }

    circle(this.x, this.y, this.r * 2);
  }

  checkMouseDoubleClick() {
    if (dist(mouseX, mouseY, this.x, this.y) < this.r) {
      let currentTime = millis();
      if (currentTime - this.lastMoveTime > this.moveCooldown) {
        this.setPosition(
          random(this.r, windowWidth - this.r),
          random(this.r, windowHeight - this.r)
        );
        moveCount++;
        this.lerpSpeed = 0.05;
        this.lastMoveTime = currentTime;
      }
    }
  }

  setPosition(x, y) {
    // Ensure the new position keeps the circle fully within the canvas bounds
    const margin = this.r;
    this.targetX = constrain(x, margin, windowWidth - margin);
    this.targetY = constrain(y, margin, windowHeight - margin);

    // Ensure the new position is at least 5 radii away from the current position
    while (dist(this.targetX, this.targetY, this.x, this.y) < this.r * 5) {
      this.targetX = random(margin, windowWidth - margin);
      this.targetY = random(margin, windowHeight - margin);
    }
  }

  isMouseInside() {
    return dist(mouseX, mouseY, this.x, this.y) < this.r;
  }
}
