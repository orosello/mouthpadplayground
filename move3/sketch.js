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

  if (dist(mouseX, mouseY, width, 0) < 50) {
    fill(255);
    noStroke();
    textFont("Inter");
    textSize(20);
    text("Top right ✓", 480, 30);
  }
  if (dist(mouseX, mouseY, 0, height) < 50) {
    fill(255);
    noStroke();
    textFont("Inter");
    textSize(20);
    text("Bottom left ✓", 10, 380);
  }
  if (dist(mouseX, mouseY, width, height) < 50) {
    fill(255);
    noStroke();
    textFont("Inter");
    textSize(20);
    text("Bottom right ✓", 450, 380);
  }
  if (dist(mouseX, mouseY, 0, 0) < 50) {
    fill(255);
    noStroke();
    textFont("Inter");
    textSize(20);
    text("Top left ✓", 10, 30);
  }

}
  


  
