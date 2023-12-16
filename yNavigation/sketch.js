let font;
let instruction = "Please lick up or down";
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
      if (this.y < windowHeight / 2) {
        instruction = "...now go down";
      } else {
        instruction = "...now go up";
      }
    } else {
      this.color = 0;
      this.isHovered = false;
    }
  }
}

let circleRadius = 40;
let topCircle, bottomCircle, movingCircle;
let cnv; // Declare the canvas variable

function setup() {
  cnv = createCanvas(windowWidth, windowHeight); // Store the canvas in the variable
  topCircle = new Circle(windowWidth / 2, 10 + circleRadius, circleRadius, 0);
  bottomCircle = new Circle(
    windowWidth / 2,
    windowHeight - 10 - circleRadius,
    circleRadius,
    0
  );
  movingCircle = new Circle(
    windowWidth / 2,
    windowHeight / 2, // Add 100 to the y-coordinate
    circleRadius,
    255
  );

  // Set mouseX and mouseY to the center of the window
  mouseX = windowWidth / 2;
  mouseY = windowHeight / 2;

  // Disable the context menu on right click
  cnv.elt.oncontextmenu = function (e) {
    e.preventDefault();
  };
}

function draw() {
  background(0);

  // Draw the rectangle only if the training is complete and the moving circle is inside the rectangle
  if (
    trainingComplete &&
    movingCircle.y >= 0 &&
    movingCircle.y <= windowHeight &&
    movingCircle.x >= windowWidth / 2 - circleRadius - 10 &&
    movingCircle.x <= windowWidth / 2 + circleRadius + 10
  ) {
    stroke(255);
    strokeWeight(2);
    fill(0);
    rect(
      windowWidth / 2 - circleRadius - 10,
      -5,
      circleRadius * 2 + 20,
      windowHeight + 10
    );
  }

  // Update and draw the circles
  topCircle.updateColor(windowWidth / 2, mouseY);
  bottomCircle.updateColor(windowWidth / 2, mouseY);
  topCircle.display();
  bottomCircle.display();

  // Check if both counters have reached 2
  if (topCircle.counter >= 2 && bottomCircle.counter >= 2) {
    instruction = "Nice! Now we will take the cursor training wheels off";
    trainingComplete = true; // Set trainingComplete to true when the instruction message changes
  }

  // Update the position of the moving circle depending on whether the training is complete
  movingCircle.y = mouseY;
  if (trainingComplete) {
    movingCircle.x = mouseX;
  }

  // Draw the moving circle
  movingCircle.display();

  // Draw the instruction
  textFont(font);
  textSize(16);
  textAlign(CENTER, CENTER);
  noStroke();
  fill(255);
  text(instruction, windowWidth / 2, windowHeight / 2);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Update the x position of the circles
  let newX = windowWidth / 2;
  topCircle.x = newX;
  bottomCircle.x = newX;
  movingCircle.x = newX;
}
