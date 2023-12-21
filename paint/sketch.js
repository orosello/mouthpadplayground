let randomCircleRadius = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);
  background(0);
}

function draw() {
  if (mouseIsPressed) {
    // randomCircleRadius = random(10, 80);
    randomCircleRadius = 70;

    fill(255);
    strokeWeight(1);
    rectMode(CENTER);
    circle(mouseX, mouseY, randomCircleRadius, randomCircleRadius);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}
