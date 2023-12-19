// Constants
const CIRCLE_RADIUS = 20;
const FONT_SIZE = 16;
const BOTTOM_TEXT_Y_OFFSET = 50;

// Variables
let bubble;
let myFont;
let hasMoved = false;

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
  bubble.checkMouseHover();

  noStroke();
  fill(255);
  const textMessage = hasMoved
    ? "Nice try, haha. Try to catch me!"
    : "Move the cursor over the circle";
  text(textMessage, windowWidth / 2, windowHeight - BOTTOM_TEXT_Y_OFFSET);
}

// Handle mouse press and release events
function mousePressed() {
  if (mouseButton === LEFT || mouseButton === RIGHT)
    bubble.mouseIsPressed = true;
}

function mouseReleased() {
  if (mouseButton === LEFT || mouseButton === RIGHT)
    bubble.mouseIsPressed = false;
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
    this.r = r;
    this.mouseIsPressed = false;
  }

  show() {
    fill(this.mouseIsPressed ? 0 : 255);
    this.mouseIsPressed ? stroke(255) : noStroke();
    circle(this.x, this.y, this.r * 2);
  }

  checkMouseHover() {
    if (dist(mouseX, mouseY, this.x, this.y) < this.r) {
      this.setPosition(
        random(this.r, windowWidth - this.r),
        random(this.r, windowHeight - this.r)
      );
      hasMoved = true;
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
}
