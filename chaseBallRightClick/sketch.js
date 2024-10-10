// Constants
const CIRCLE_RADIUS = 50;
const FONT_SIZE = 16;
const BOTTOM_TEXT_Y_OFFSET = 80;
const BUTTON_PADDING = 3;
const BUTTON_FONT_SIZE = 11;
const BUTTON_MIN_WIDTH = 150;
const ANIMATION_DURATION = 1000; // 1 second animation
const MAX_SCALE = 3; // Maximum scale factor for the animation

// Variables
let bubble;
let myFont;
let moveCount = 0; // New variable to keep track of the number of times the bubble has moved
let easyModeButton;
let isEasyMode = false;

// Preload assets
function preload() {
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

// Setup the canvas and bubble
function setup() {
  createCanvas(windowWidth, windowHeight);
  bubble = new Bubble(windowWidth / 2, windowHeight / 2, CIRCLE_RADIUS);

  // Create Easy Mode button
  easyModeButton = createButton("Easy Mode: OFF");
  styleButton(easyModeButton);
  positionButton();
  easyModeButton.mousePressed(toggleEasyMode);

  // Prevent the context menu from opening on right click
  canvas.oncontextmenu = (e) => e.preventDefault();

  // Set text properties
  textFont(myFont);
  textSize(FONT_SIZE);
  textAlign(CENTER);
}

// Style the Easy Mode button
function styleButton(button) {
  button.style("font-family", '"Press Start 2P", cursive');
  button.style("font-size", `${BUTTON_FONT_SIZE}px`);
  button.style("color", "#FFFFFF");
  button.style("background-color", "#000000");
  button.style("border", "0px solid #FFFFFF");
  button.style("padding", `${BUTTON_PADDING}px ${BUTTON_PADDING * 2}px`);
  button.style("cursor", "pointer");
  button.style("min-width", `${BUTTON_MIN_WIDTH}px`);
  button.style("white-space", "nowrap");
}

function positionButton() {
  easyModeButton.size(BUTTON_MIN_WIDTH, AUTO);
  let buttonWidth = easyModeButton.width;
  let buttonHeight = easyModeButton.height;
  easyModeButton.position(
    windowWidth - buttonWidth - BUTTON_PADDING - 20,
    BUTTON_PADDING
  );
}

// Draw the canvas and bubble
function draw() {
  background(0);
  bubble.update();
  bubble.show();

  noStroke();
  fill(255);
  let textMessage;
  if (isEasyMode) {
    textMessage = "Easy Mode: Right-click the circle";
  } else if (moveCount === 0) {
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
    bubble.startAnimation();
    if (!isEasyMode) {
      let newX, newY;
      do {
        newX = random(CIRCLE_RADIUS, windowWidth - CIRCLE_RADIUS);
        newY = random(CIRCLE_RADIUS, windowHeight - CIRCLE_RADIUS);
      } while (dist(newX, newY, bubble.x, bubble.y) < CIRCLE_RADIUS * 2); // Ensure new position is sufficiently different

      bubble.setPosition(newX, newY);
      moveCount++; // Increment the move count each time the bubble moves
    }
  }
}

function mouseReleased() {
  if ((mouseButton === LEFT || mouseButton === RIGHT) && bubble.isMouseInside())
    bubble.mouseIsPressed = false;
}

// Handle window resize event
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionButton();
  if (isEasyMode) {
    bubble.setPosition(windowWidth / 2, windowHeight / 2);
  } else {
    bubble.setPosition(
      constrain(windowWidth / 2, CIRCLE_RADIUS, windowWidth - CIRCLE_RADIUS),
      constrain(windowHeight / 2, CIRCLE_RADIUS, windowHeight - CIRCLE_RADIUS)
    );
  }
}

// Toggle Easy Mode
function toggleEasyMode() {
  isEasyMode = !isEasyMode;
  easyModeButton.html(isEasyMode ? "Easy Mode: ON" : "Easy Mode: OFF");

  if (isEasyMode) {
    bubble.setPosition(windowWidth / 2, windowHeight / 2);
    bubble.stopMoving();
  } else {
    bubble.resumeMoving();
    bubble.setPosition(
      random(CIRCLE_RADIUS, windowWidth - CIRCLE_RADIUS),
      random(CIRCLE_RADIUS, windowHeight - CIRCLE_RADIUS)
    );
  }
}

// Bubble class
class Bubble {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.r = r;
    this.originalRadius = r;
    this.mouseIsPressed = false;
    this.isMoving = true;
    this.animationStartTime = 0;
    this.isAnimating = false;
  }

  update() {
    if (this.isMoving) {
      this.x = lerp(this.x, this.targetX, 0.05);
      this.y = lerp(this.y, this.targetY, 0.05);
    }

    if (this.isAnimating) {
      let progress = (millis() - this.animationStartTime) / ANIMATION_DURATION;
      if (progress >= 1) {
        this.isAnimating = false;
        this.r = this.originalRadius;
      } else {
        let scale = 1 + (MAX_SCALE - 1) * sin(progress * PI);
        this.r = this.originalRadius * scale;
      }
    }
  }

  show() {
    if (this.isMouseInside()) {
      stroke(255);
      strokeWeight(10);
    } else {
      noStroke();
    }
    fill(this.mouseIsPressed ? 0 : 255);
    circle(this.x, this.y, this.r * 2);
  }

  setPosition(x, y) {
    this.targetX = constrain(x, CIRCLE_RADIUS, windowWidth - CIRCLE_RADIUS);
    this.targetY = constrain(y, CIRCLE_RADIUS, windowHeight - CIRCLE_RADIUS);
  }

  isMouseInside() {
    return dist(mouseX, mouseY, this.x, this.y) < this.r;
  }

  stopMoving() {
    this.isMoving = false;
  }

  resumeMoving() {
    this.isMoving = true;
  }

  startAnimation() {
    this.isAnimating = true;
    this.animationStartTime = millis();
  }
}
