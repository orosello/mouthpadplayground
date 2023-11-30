// Define the main circle object
let circle = {
  x: 200,
  y: 200,
  diameter: 50,
  dragging: false,
  offsetX: 0,
  offsetY: 0,
  disappearing: false,
};

// Define the target circle object
let targetCircle = {
  x: 300,
  y: 300,
  diameter: 50,
};

// This function is called once when the program starts
function setup() {
  // Create a canvas that fills the window
  createCanvas(windowWidth, windowHeight);

  // Position the target circle in the center of the canvas
  targetCircle.x = width / 2;
  targetCircle.y = height / 2;
}

// This function is called repeatedly to draw the scene
function draw() {
  // Clear the canvas with a black background
  background(0);

  // Set the text properties
  textSize(16);
  fill(255);
  noStroke();
  textAlign(CENTER, BOTTOM);

  // Display the instructions at the bottom of the canvas
  text("Drag and drop the white circle into the hole", width / 2, height - 20);

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
  // Draw the main circle with a white fill
  fill(255);
  ellipse(circle.x, circle.y, circle.diameter);

  // Draw the target circle with a white outline and no fill
  noFill();
  stroke(255);
  ellipse(targetCircle.x, targetCircle.y, targetCircle.diameter);

  // Reset the stroke for future drawing
  noStroke();
}

// Check if the main circle has reached the target
function checkCircleReachedTarget() {
  let distance = dist(circle.x, circle.y, targetCircle.x, targetCircle.y);
  let closeEnough = distance < circle.diameter / 2;

  // If the circle is close enough to the target, start the disappearing animation
  if (closeEnough) {
    circle.disappearing = true;
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
  circle.x = random(0, width);
  circle.y = random(0, height);
  circle.diameter = 50;
  circle.disappearing = false;
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
}

// This function is called when the window is resized
function windowResized() {
  // Resize the canvas to fill the window
  resizeCanvas(windowWidth, windowHeight);

  // Reposition the target circle in the center of the canvas
  targetCircle.x = width / 2;
  targetCircle.y = height / 2;
}
