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
  }

  show() {
    fill(this.mouseIsPressed ? 0 : 255);
    this.mouseIsPressed ? stroke(255) : noStroke();
    this.x = lerp(this.x, this.targetX, 0.05);
    this.y = lerp(this.y, this.targetY, 0.05);
    circle(this.x, this.y, this.r * 2);
  }

  checkMouseDoubleClick() {
    if (dist(mouseX, mouseY, this.x, this.y) < this.r) {
      this.setPosition(
        random(this.r, windowWidth - this.r),
        random(this.r, windowHeight - this.r)
      );
      moveCount++; // Added this line
    }
  }

  setPosition(x, y) {
    while (dist(x, y, this.x, this.y) < this.r * 5) {
      x = random(this.r, windowWidth - this.r);
      y = random(this.r, windowHeight - this.r);
    }
    this.targetX = x;
    this.targetY = y;
  }

  isMouseInside() {
    return dist(mouseX, mouseY, this.x, this.y) < this.r;
  }
}
