function setup() {
  createCanvas(600, 400);
}

function draw() {
  background(0);

  // Set the fill color based on the mouse state
  if (mouseIsPressed) {
    fill(255);
  } else {
    noFill();
  }

  circle(mouseX, mouseY, 50, 50);

  noFill();
  stroke(255); // Set the stroke color to white
  rectMode(CENTER);
  rect(300, 200, width - 10, height - 10); // Draw a rectangle around the canvas
}

