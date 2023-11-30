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

  // Calculate the radius and height of the cylinder based on the window size
  let radius = windowWidth * 0.03; // 5% of window width
  let height = windowHeight * 0.95; // 80% of window height

  // Draw a cylinder with calculated radius and height, and increased resolution
  cylinder(radius, height, 64, 64);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}
