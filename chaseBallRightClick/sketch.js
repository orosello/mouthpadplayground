// Constants
const CIRCLE_RADIUS = 50;
const FONT_SIZE = 16;
const BOTTOM_TEXT_Y_OFFSET = 100;
const ANIMATION_DURATION = 1000; // 1 second animation
const MAX_SCALE = 3; // Maximum scale factor for the animation
const BUTTON_PADDING = 5;
const BUTTON_FONT_SIZE = 14; // Revert back to 11
const BUTTON_MIN_WIDTH = 150; // Revert back to 150
const WRONG_CLICK_DURATION = 1000; // Duration to show wrong click message
const BUTTON_MARGIN_BOTTOM = 40; // New constant for bottom margin
const BUTTON_TOP_MARGIN = 70; // Space for navbar

// Variables
let bubble;
let myFont;
let moveCount = 1;
let easyModeButton;
let isEasyMode = false;
let wrongClickTime = 0;
let showingWrongClick = false;

// Preload assets
function preload() {
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

// Setup the canvas, bubble, and button
function setup() {
  createCanvas(windowWidth, windowHeight);
  bubble = new Bubble(windowWidth / 2, windowHeight / 2, CIRCLE_RADIUS);

  // Create Easy Mode button
  easyModeButton = createButton("Easy: OFF");
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
  button.style("background-color", "black");
  button.style("border", "1px solid #FFFFFF");
  button.style("padding", `${BUTTON_PADDING}px ${BUTTON_PADDING * 2}px`);
  button.style("cursor", "pointer");
  button.style("min-width", `${BUTTON_MIN_WIDTH}px`);
  button.style("white-space", "nowrap");
}

function positionButton() {
  easyModeButton.size(BUTTON_MIN_WIDTH, AUTO);

  // Position at top left with padding, below navbar
  easyModeButton.position(
    BUTTON_PADDING + 20, // Small padding from left edge
    BUTTON_TOP_MARGIN // Space below navbar
  );
}

// Draw the canvas, bubble, and update text
function draw() {
  background(0);
  bubble.update();
  bubble.show();
  noStroke();
  fill(255);

  // Show wrong click message
  if (showingWrongClick && millis() - wrongClickTime < WRONG_CLICK_DURATION) {
    text(
      "Whoops! That's a left click!",
      windowWidth / 2,
      windowHeight - BOTTOM_TEXT_Y_OFFSET
    );
    return;
  }

  if (isEasyMode) {
    text(
      "Easy Mode: Right click the circle",
      windowWidth / 2,
      windowHeight - BOTTOM_TEXT_Y_OFFSET
    );
  } else if (moveCount === 1) {
    text(
      "Right click on the circle",
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
  if (bubble.isMouseInside()) {
    bubble.mouseIsPressed = true;

    if (mouseButton === LEFT) {
      showingWrongClick = true;
      wrongClickTime = millis();
    } else if (mouseButton === RIGHT) {
      bubble.startAnimation();
      if (!isEasyMode) {
        bubble.checkMouseClick();
      } else {
        moveCount++;
      }
    }
  }
}

function mouseReleased() {
  if (
    (mouseButton === LEFT || mouseButton === RIGHT) &&
    bubble.isMouseInside()
  ) {
    bubble.mouseIsPressed = false;
  }
}

// Handle window resize event
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionButton();
  if (isEasyMode) {
    bubble.setPosition(windowWidth / 2, windowHeight / 2);
  }
}

// Toggle Easy Mode
function toggleEasyMode() {
  isEasyMode = !isEasyMode;
  easyModeButton.html(isEasyMode ? "Easy: ON" : "Easy: OFF"); // Revert text back

  if (isEasyMode) {
    bubble.setPosition(windowWidth / 2, windowHeight / 2);
    bubble.stopMoving();
  } else {
    bubble.resumeMoving();
    bubble.moveRandomly(); // Move to a random position when exiting easy mode
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
    this.lerpSpeed = 0.05;
    this.minLerpDistance = 1; // Minimum distance to consider lerping complete
    this.lastMoveTime = 0;
    this.moveCooldown = 200; // 200 milliseconds cooldown
    this.isMoving = true;
    this.animationStartTime = 0;
    this.isAnimating = false;
  }

  update() {
    // Update position with lerping if moving
    if (this.isMoving) {
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
    }

    // Update animation
    if (this.isAnimating) {
      let progress = (millis() - this.animationStartTime) / ANIMATION_DURATION;
      if (progress >= 1) {
        this.isAnimating = false;
        this.r = this.originalRadius;
      } else {
        let scale = 1 + (MAX_SCALE - 1) * sin(progress * PI); // Smooth scaling effect
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
    fill(255); // Always fill with white
    circle(this.x, this.y, this.r * 2);
  }

  checkMouseClick() {
    let currentTime = millis();
    if (currentTime - this.lastMoveTime > this.moveCooldown) {
      this.moveRandomly();
      moveCount++;
      this.lastMoveTime = currentTime;
    }
  }

  moveRandomly() {
    this.setPosition(
      random(this.originalRadius, windowWidth - this.originalRadius),
      random(this.originalRadius, windowHeight - this.originalRadius)
    );
    this.lerpSpeed = 0.05;
  }

  setPosition(x, y) {
    // Ensure the new position keeps the circle fully within the canvas bounds
    const margin = this.originalRadius;
    this.targetX = constrain(x, margin, windowWidth - margin);
    this.targetY = constrain(y, margin, windowHeight - margin);

    // Ensure the new position is at least 5 radii away from the current position
    while (
      dist(this.targetX, this.targetY, this.x, this.y) <
      this.originalRadius * 5
    ) {
      this.targetX = random(margin, windowWidth - margin);
      this.targetY = random(margin, windowHeight - margin);
    }

    // If the bubble is not moving, update x and y immediately
    if (!this.isMoving) {
      this.x = this.targetX;
      this.y = this.targetY;
    }
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
