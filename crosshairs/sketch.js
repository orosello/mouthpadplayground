let circleRadius = 80;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Prevent the context menu from opening on right click
  canvas.oncontextmenu = function (e) {
    e.preventDefault();
  };
}

function draw() {
  background("black");
  stroke(50);
  strokeWeight(2);
  line(mouseX, 0, mouseX, windowHeight);
  line(0, mouseY, windowWidth, mouseY);

  // Check if the mouse is pressed
  if (mouseIsPressed) {
    fill(128, 0, 128); // Set fill to purple
  } else {
    fill(255); // Set fill to white
  }

  noStroke();
  ellipse(mouseX, mouseY, circleRadius, circleRadius);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  bubble1.x = windowWidth / 2;
  bubble1.y = windowHeight / 2;
}
