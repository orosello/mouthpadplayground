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
  movingCircle = new Circle(0, windowHeight / 2, circleRadius, 255);
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
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
