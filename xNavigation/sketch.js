let font;
let instruction = "Please lick left or right";
let trainingComplete = false; // Add a variable to track if the training is complete

function preload() {
  font = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

class Circle {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.counter = 0; // Add a counter for each circle
    this.isHovered = false; // Add a hover state for each circle
  }

  display() {
    stroke(255);
    strokeWeight(2);
    fill(this.color);
    circle(this.x, this.y, this.radius * 2);
  }

  updateColor(mouseX, mouseY) {
    let d = dist(mouseX, mouseY, this.x, this.y);
    if (d <= this.radius * 2) {
      this.color = "white";
      if (!this.isHovered) {
        this.counter++; // Increment the counter when the mouse first hovers over the circle
        this.isHovered = true;
      }
      if (this.x < windowWidth / 2) {
        instruction = "...now go right";
      } else {
        instruction = "...now go left";
      }
    } else {
      this.color = 0;
      this.isHovered = false;
    }
  }
}

let circleRadius = 40;
let leftCircle, rightCircle, movingCircle;

function setup() {
  createCanvas(windowWidth, windowHeight);
  leftCircle = new Circle(10 + circleRadius, windowHeight / 2, circleRadius, 0);
  rightCircle = new Circle(
    windowWidth - 10 - circleRadius,
    windowHeight / 2,
    circleRadius,
    0
  );
  movingCircle = new Circle(
    windowWidth / 2,
    windowHeight / 2,
    circleRadius,
    255
  );

  // Set mouseX and mouseY to the center of the window
  mouseX = windowWidth / 2;
  mouseY = windowHeight / 2;
}

function draw() {
  background(0);

  // Draw the rectangle only if the training is complete and the moving circle is inside the rectangle
  if (
    trainingComplete &&
    movingCircle.x >= 0 &&
    movingCircle.x <= windowWidth &&
    movingCircle.y >= windowHeight / 2 - circleRadius - 10 &&
    movingCircle.y <= windowHeight / 2 + circleRadius + 10
  ) {
    stroke(255);
    strokeWeight(2);
    fill(0);
    rect(
      -5,
      windowHeight / 2 - circleRadius - 10,
      windowWidth + 10,
      circleRadius * 2 + 20
    );
  }

  // Update and draw the circles
  leftCircle.updateColor(mouseX, windowHeight / 2);
  rightCircle.updateColor(mouseX, windowHeight / 2);
  leftCircle.display();
  rightCircle.display();

  // Check if both counters have reached 2
  if (leftCircle.counter >= 2 && rightCircle.counter >= 2) {
    instruction = "Nice! Now we will take the cursor training wheels off";
    trainingComplete = true; // Set trainingComplete to true when the instruction message changes
  }

  // Update the position of the moving circle depending on whether the training is complete
  movingCircle.x = mouseX;
  if (trainingComplete) {
    movingCircle.y = mouseY;
  }

  // Draw the moving circle
  movingCircle.display();

  // Draw the instruction
  textFont(font);
  textSize(16);
  textAlign(CENTER, CENTER);
  noStroke();
  fill(255);
  text(instruction, windowWidth / 2, windowHeight - 50);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Update the y position of the circles
  let newY = windowHeight / 2;
  leftCircle.y = newY;
  rightCircle.y = newY;
  movingCircle.y = newY;
}
