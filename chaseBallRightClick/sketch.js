// Constants
const CIRCLE_RADIUS = 50;
const FONT_SIZE = 16;
const BOTTOM_TEXT_Y_OFFSET = 80;

// Variables
let bubble;
let myFont;
let moveCount = 0; // New variable to keep track of the number of times the bubble has moved

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
  let textMessage;
  if (moveCount === 0) {
    textMessage =
      "To right-click on the circle, \napply tight suction in the back of your mouth. \nMuch like sucking on a straw but without swallowing";
  } else if (moveCount === 1) {
    textMessage = "Yes! Let's try it again";
  } else {
    textMessage = ""; // No text after the bubble has moved more than once
  }
  text(textMessage, windowWidth / 2, windowHeight - BOTTOM_TEXT_Y_OFFSET);
}

// Handle mouse press and release events
function mousePressed() {
  if (mouseButton === RIGHT && bubble.isMouseInside()) {
    let newX, newY;
    do {
      newX = random(CIRCLE_RADIUS, windowWidth - CIRCLE_RADIUS);
      newY = random(CIRCLE_RADIUS, windowHeight - CIRCLE_RADIUS);
    } while (dist(newX, newY, bubble.x, bubble.y) < CIRCLE_RADIUS * 2); // Ensure new position is sufficiently different

    bubble.setPosition(newX, newY);
    moveCount++; // Increment the move count each time the bubble moves
  }
}

function mouseReleased() {
  if ((mouseButton === LEFT || mouseButton === RIGHT) && bubble.isMouseInside())
    bubble.mouseIsPressed = false;
}

// Handle window resize event
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  bubble.setPosition(
    constrain(windowWidth / 2, CIRCLE_RADIUS, windowWidth - CIRCLE_RADIUS),
    constrain(windowHeight / 2, CIRCLE_RADIUS, windowHeight - CIRCLE_RADIUS)
  );
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
    if (this.isMouseInside()) {
      stroke(255);
      strokeWeight(10);
    } else {
      noStroke();
    }
    fill(this.mouseIsPressed ? 0 : 255);
    this.x = lerp(this.x, this.targetX, 0.05);
    this.y = lerp(this.y, this.targetY, 0.05);
    circle(this.x, this.y, this.r * 2);
  }

  setPosition(x, y) {
    this.targetX = constrain(x, CIRCLE_RADIUS, windowWidth - CIRCLE_RADIUS);
    this.targetY = constrain(y, CIRCLE_RADIUS, windowHeight - CIRCLE_RADIUS);
  }

  isMouseInside() {
    return dist(mouseX, mouseY, this.x, this.y) < this.r;
  }
}
