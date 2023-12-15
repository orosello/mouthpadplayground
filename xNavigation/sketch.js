let circleRadius = 40;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  // Set the stroke color to white
  stroke(255);
  // Set the stroke weight to 2
  strokeWeight(2);
  // Set the fill color to black
  fill(0);

  // Draw the rectangle
  rect(
    -windowWidth,
    windowHeight / 2 - circleRadius - 10,
    windowWidth * 3,
    circleRadius * 2 + 20
  );

  noStroke(); // no stroke for the circle
  fill(255); // Set the fill color for the circle
  circle(mouseX, windowHeight / 2, circleRadius * 2); // Draw the circle
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
