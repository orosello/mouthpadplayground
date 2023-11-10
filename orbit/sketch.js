function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
  background(0);

  // Orbit control enables easy 3D rotation of canvas with mouse
  // Only when mouse is pressed
  if (mouseIsPressed) {
    orbitControl();
  }

  // Set the fill color to white
  fill(255);
  // Set the stroke color to black
  stroke(0);

  // Rotate the cylinder 90 degrees around the X-axis
  rotateX(HALF_PI);

  // Draw a cylinder with radius 50, height 100, and increased resolution
  cylinder(10, 500, 64, 64);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}
