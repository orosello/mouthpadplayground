let circleRadius = 40;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);
  stroke(50);
  strokeWeight(100); // Set the stroke weight to the circle's radius
  line(0, windowHeight / 2, windowWidth, windowHeight / 2);

  noStroke(); // Ensure the circle has no stroke
  fill(255); // Set the fill color for the circle
  circle(mouseX, windowHeight / 2, circleRadius * 2); // Draw the circle
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}