let circleDiameter = 70;
let gameWon = false;

// Define the main circle object
let circle = {
  x: 200,
  y: 200,
  diameter: circleDiameter,
  dragging: false,
  offsetX: 0,
  offsetY: 0,
  disappearing: false,
  jitter: false,
  hovering: false,
};

// Define the target circle object
let targetCircle = {
  x: 300,
  y: 300,
  diameter: circleDiameter,
};

function preload() {
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

// This function is called once when the program starts
function setup() {
  // Create a canvas that fills the window
  canvas = createCanvas(windowWidth, windowHeight);

  // Position the target circle in the center of the canvas with a margin
  let margin = targetCircle.diameter;
  targetCircle.x = constrain(width / 2, margin, width - margin);
  targetCircle.y = constrain(height / 2, margin, height - margin);

  textFont(myFont);
  textSize(16);
  textAlign(CENTER);

  // Disable right-click context menu
  canvas.elt.oncontextmenu = (e) => e.preventDefault();

  // Prevent background selection/highlighting
  canvas.elt.style.touchAction = "none"; // Prevent default touch actions
  canvas.elt.style.webkitTapHighlightColor = "rgba(0,0,0,0)"; // For Safari on iOS

  // Disable text selection on the canvas
  canvas.elt.style.userSelect = "none";
  canvas.elt.style.webkitUserSelect = "none"; // For Safari on iOS
  canvas.elt.style.msUserSelect = "none"; // For IE/Edge
  canvas.elt.style.mozUserSelect = "none"; // For Firefox
}

// This function is called repeatedly to draw the scene
function draw() {
  // Clear the canvas with a black background
  background(0);

  // Set the text properties
  textSize(16);

  noStroke();
  fill(255);
  textAlign(CENTER, BOTTOM);

  // Display the instructions at the bottom of the canvas
  noStroke();
  fill(255);
  if (gameWon) {
    text("Nice!", windowWidth / 2, windowHeight - 50);
  } else if (circle.hovering) {
    text("...now drop the ball", windowWidth / 2, windowHeight - 50);
  } else {
    text(
      "Drag and drop the white circle into the hole",
      windowWidth / 2,
      windowHeight - 50
    );
  }

  // If the circle is being dragged, update its position
  if (circle.dragging) {
    updateCirclePosition();
  }

  // Draw the main circle and the target circle
  drawCircles();

  // Check if the main circle has reached the target
  checkCircleReachedTarget();

  // If the circle is disappearing, animate it
  if (circle.disappearing && !circle.dragging) {
    animateCircleDisappearing();
  }
}

// Update the position of the circle based on the mouse position
function updateCirclePosition() {
  let newX = mouseX + circle.offsetX;
  let newY = mouseY + circle.offsetY;

  // Ensure the circle stays within the bounds of the canvas
  circle.x = constrain(newX, circle.diameter / 2, width - circle.diameter / 2);
  circle.y = constrain(newY, circle.diameter / 2, height - circle.diameter / 2);
}

// Draw the main circle and the target circle
function drawCircles() {
  // Check if the mouse is hovering over the circle
  checkMouseHover();

  // Draw the main circle with a white fill
  if (circle.hovering) {
    stroke(255);
    strokeWeight(10);
  } else {
    noStroke();
  }
  fill(255);
  if (circle.jitter) {
    // Add a random offset to the circle's position to create a jitter effect
    let jitterX = random(-2, 2);
    let jitterY = random(-2, 2);
    ellipse(circle.x + jitterX, circle.y + jitterY, circle.diameter);
  } else {
    ellipse(circle.x, circle.y, circle.diameter);
  }

  // Draw the target circle with a white outline and no fill
  noFill();
  stroke(255);
  strokeWeight(1);
  ellipse(targetCircle.x, targetCircle.y, targetCircle.diameter);

  // Reset the stroke for future drawing
  noStroke();
}

// Check if the mouse is hovering over the circle
function checkMouseHover() {
  let distance = dist(mouseX, mouseY, circle.x, circle.y);
  circle.hovering = distance < circle.diameter / 2;
}

// Check if the main circle has reached the target
function checkCircleReachedTarget() {
  let distance = dist(circle.x, circle.y, targetCircle.x, targetCircle.y);
  let closeEnough = distance < circle.diameter / 2;

  // If the circle is close enough to the target and it's being dragged, start the disappearing animation and the jitter effect
  if (closeEnough && circle.dragging) {
    circle.disappearing = true;
    circle.jitter = true; // Start the jitter effect
    circle.hovering = true; // Set hovering to true when the circle is close enough to the target
  } else if (!closeEnough && circle.dragging) {
    circle.disappearing = false; // Stop the disappearing animation
    circle.jitter = false; // Stop the jitter effect
    circle.hovering = false; // Set hovering to false when the circle is not close enough to the target
  }
}

// Animate the circle disappearing
function animateCircleDisappearing() {
  // Decrease the diameter of the circle
  circle.diameter -= 2;

  // If the circle has disappeared, reset it
  if (circle.diameter <= 0) {
    resetCircle();
  }
}

// Reset the circle to a new random position and stop the disappearing animation
function resetCircle() {
  let margin = circleDiameter;
  let safeDistance = circleDiameter + targetCircle.diameter;

  do {
    circle.x = random(margin, width - margin);
    circle.y = random(margin, height - margin);
  } while (
    dist(circle.x, circle.y, targetCircle.x, targetCircle.y) < safeDistance
  );

  circle.diameter = circleDiameter;
  circle.disappearing = false;
  circle.hovering = false; // Reset the hovering state when the circle is reset
  gameWon = false; // Reset the game state when the circle is reset
}

// This function is called when the mouse button is pressed
function mousePressed() {
  // Check if the mouse is inside the circle
  let distance = dist(mouseX, mouseY, circle.x, circle.y);
  let insideCircle = distance < circle.diameter / 2;

  // If the mouse is inside the circle, start dragging it
  if (insideCircle) {
    startDraggingCircle();
  }
}

// Start dragging the circle
function startDraggingCircle() {
  circle.dragging = true;

  // Keep track of the offset between the mouse and the circle's position
  circle.offsetX = circle.x - mouseX;
  circle.offsetY = circle.y - mouseY;
}

// This function is called when the mouse button is released
function mouseReleased() {
  // Stop dragging the circle
  circle.dragging = false;
  circle.jitter = false;

  // If the circle is hovering over the target when the mouse button is released, the game is won
  if (circle.hovering) {
    gameWon = true;
  }
}

// This function is called when the window is resized
function windowResized() {
  // Resize the canvas to fill the window
  resizeCanvas(windowWidth, windowHeight);

  // Reposition the target circle in the center of the canvas
  targetCircle.x = width / 2;
  targetCircle.y = height / 2;
}
