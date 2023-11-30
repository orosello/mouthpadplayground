let width = 710;
let height = 400;
let circleRadius = 40;
let lineY = height / 2; // Store the y-coordinate of the line

function setup() {
  createCanvas(width, height);
}

function draw() {
  background(0);

  // Check if the circle is outside the bounds of the line
  if (mouseY < lineY - circleRadius || mouseY > lineY + circleRadius) {
    stroke(0); // Change the stroke color to red
  } else {
    stroke(50); // Change it back to the original color
  }

  strokeWeight(100); // Set the stroke weight to the circle's radius
  line(0, lineY, width, lineY);

  noStroke(); // Ensure the circle has no stroke
  fill(255); // Set the fill color for the circle
  circle(mouseX, mouseY, circleRadius * 2); // Draw the circle
}