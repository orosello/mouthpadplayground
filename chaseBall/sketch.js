// Constants
const CIRCLE_RADIUS = 20;
const FONT_SIZE = 16;
const BOTTOM_TEXT_Y_OFFSET = 100;

// Variables
let bubble;
let myFont;
let moveCount = 0; // Tracks the number of moves

// Preload assets
function preload() {
  // Load the font from the assets directory
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

// Setup the canvas and bubble
function setup() {
  // Create the canvas
  createCanvas(windowWidth, windowHeight);

  // Initialize the bubble in the center of the screen
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
  // Set the background color
  background(0);

  // Show the bubble and check if the mouse is hovering over it
  bubble.show();
  bubble.checkMouseHover();

  // Set the text color and stroke
  noStroke();
  fill(255);

  // Determine the message to display based on the move count
  let textMessage;
  if (moveCount === 0) {
    textMessage = "Move the cursor over the circle";
  } else if (moveCount === 1) {
    textMessage = "Nice try, haha. Try to catch me!";
  } else {
    textMessage = ""; // No message after the third move
  }

  // Display the message at the bottom of the screen
  text(textMessage, windowWidth / 2, windowHeight - BOTTOM_TEXT_Y_OFFSET);
}

// Handle mouse press and release events
function mousePressed() {
  // Check if the left or right mouse button is pressed
  if (mouseButton === LEFT || mouseButton === RIGHT)
    bubble.mouseIsPressed = true;
}

function mouseReleased() {
  // Check if the left or right mouse button is released
  if (mouseButton === LEFT || mouseButton === RIGHT)
    bubble.mouseIsPressed = false;
}

// Handle window resize event
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
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

  // Display the bubble
  show() {
    // Set the fill color and stroke based on whether the mouse is pressed
    fill(this.mouseIsPressed ? 0 : 255);
    this.mouseIsPressed ? stroke(255) : noStroke();

    // Move the bubble towards its target position
    this.x = lerp(this.x, this.targetX, 0.05);
    this.y = lerp(this.y, this.targetY, 0.05);

    // Draw the bubble
    circle(this.x, this.y, this.r * 2);
  }

  // Check if the mouse is hovering over the bubble
  checkMouseHover() {
    if (dist(mouseX, mouseY, this.x, this.y) < this.r) {
      // If the mouse is hovering, move the bubble to a random position
      this.setPosition(
        random(this.r, windowWidth - this.r),
        random(this.r, windowHeight - this.r)
      );

      // Increment the move count
      moveCount++;
    }
  }

  // Set the target position of the bubble
  setPosition(x, y) {
    const minDistance = 100; // Minimum distance from the current position

    // Ensure the new position is at least minDistance away from the current position
    while (dist(this.x, this.y, x, y) < minDistance) {
      x = random(this.r, windowWidth - this.r);
      y = random(this.r, windowHeight - this.r);
    }

    // Ensure the new position is within the canvas boundaries, accounting for the radius
    x = constrain(x, this.r, windowWidth - this.r);

    // Ensure the new position is above the bottom text area, accounting for the circle's radius
    const maxY = windowHeight - BOTTOM_TEXT_Y_OFFSET - this.r;
    y = constrain(y, this.r, maxY);

    // Set the target position
    this.targetX = x;
    this.targetY = y;
  }
}
