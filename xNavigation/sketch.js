let font;
let instruction = "Please lick left or right";

function preload() {
  font = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

class Circle {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
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
      if (this.x < windowWidth / 2) {
        instruction = "...now go right";
      } else {
        instruction = "...now go left";
      }
    } else {
      this.color = 0;
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

  // Draw the rectangle
  stroke(255);
  strokeWeight(2);
  fill(0);
  rect(
    -5,
    windowHeight / 2 - circleRadius - 10,
    windowWidth + 10,
    circleRadius * 2 + 20
  );

  // Update and draw the circles
  leftCircle.updateColor(mouseX, windowHeight / 2);
  rightCircle.updateColor(mouseX, windowHeight / 2);
  leftCircle.display();
  rightCircle.display();

  // Draw the moving circle
  movingCircle.x = mouseX;
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
