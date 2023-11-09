let randomCircleRadius = 0;

function setup() {
  createCanvas(600, 600);
  colorMode(RGB);
  print("hello");
  background(0);
}

function draw() {
  if (mouseIsPressed) {
    randomCircleRadius = random(10,80);

    fill(255);
    strokeWeight(1);
    rectMode(CENTER);
    circle(mouseX, mouseY, randomCircleRadius, randomCircleRadius);
  }
}