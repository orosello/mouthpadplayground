let circleRadius = 40;
let rectWidth = windowWidth - 20; // Reduce the rectangle width slightly

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  // Draw the rectangle only when the mouse is inside it
  if (
    mouseY > windowHeight / 2 - circleRadius - 10 &&
    mouseY < windowHeight / 2 + circleRadius + 10
  ) {
    fill(0); // Set the fill color to a gray color
    stroke(255); // Set the stroke color to white
    rect(
      -5,
      windowHeight / 2 - circleRadius - 10,
      windowWidth * 3,
      circleRadius * 2 + 20
    );
  }

  noStroke(); // no stroke for the circle
  fill(255); // Set the fill color for the circle
  circle(mouseX, mouseY, circleRadius * 2); // Draw the circle
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
