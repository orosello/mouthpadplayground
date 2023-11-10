let width = 710;
let height = 400;
let circleRadius = 40;

function setup() {
  createCanvas(width, height);
}

function draw() {
  background(0);
  stroke(50);
  strokeWeight(100); // Set the stroke weight to the circle's radius
  line(0, height / 2, width, height / 2);

  noStroke(); // Ensure the circle has no stroke
  fill(255); // Set the fill color for the circle
  circle(mouseX, 200, circleRadius * 2); // Draw the circle
}
