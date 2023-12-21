let randomCircleRadius = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);
  background(0);

  // Disable right-click context menu
  canvas = document.querySelector("canvas");
  canvas.oncontextmenu = function (e) {
    e.preventDefault();
  };
}

function draw() {
  if (mouseIsPressed) {
    // randomCircleRadius = random(20, 80);
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
