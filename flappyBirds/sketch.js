const GRAVITY = 0.6;
const LIFT = -15;
const PIPE_WIDTH = 30;
const PIPE_SPEED = 2;
const BIRD_DIAMETER = 64;

let bird;
let pipes = [];
let score = 0;
let myFont;
let scoreGraphics; // Graphics buffer for the score

function preload() {
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

function setup() {
  // Adjust canvas size to fit the window dimensions
  createCanvas(windowWidth, windowHeight);
  bird = new Bird();
  pipes.push(new Pipe());

  // Create the graphics buffer for the score
  scoreGraphics = createGraphics(windowWidth, windowHeight);
}

function draw() {
  background(0);
  updatePipes();
  updateBird();

  // Draw the floor
  fill(100); // Set a color for the floor
  rect(0, height - 10, width, 10); // Draw a rectangle at the bottom

  // Clear the score graphics buffer
  scoreGraphics.clear();

  // Set the text properties for the score
  scoreGraphics.textFont(myFont);
  scoreGraphics.textSize(16);
  scoreGraphics.fill(0); // Set the fill color to black for the rectangle
  scoreGraphics.noStroke(); // Remove the stroke

  // Calculate the width and height of the score text
  let scoreText = "Score: " + String(score).padStart(4, "0");
  let textWidth = scoreGraphics.textWidth(scoreText);
  let textHeight = 16;

  // Calculate the position of the score text
  let textX = 20; // Align to the left with 20px padding
  let textY = 50;

  // Draw a black rectangle behind the score text
  scoreGraphics.rect(textX, textY - textHeight, textWidth, textHeight);

  // Display the score
  scoreGraphics.fill(255); // Set the fill color back to white for the text
  scoreGraphics.text(scoreText, textX, textY);

  // Display the score graphics buffer on top of everything else
  image(scoreGraphics, 0, 0);

  // Calculate the pipe frequency based on the current score
  let baseFrequency = 300; // Increase the base frequency to make the game easier
  let scoreFactor = Math.floor(score / 5); // Calculate the score factor
  let frequency = baseFrequency - scoreFactor * 50; // Decrease the frequency substantially every 5 points

  // Generate a new pipe based on the calculated frequency
  if (frameCount % frequency == 0) {
    // Only generate a new pipe if the last pipe is far enough from the right edge
    if (
      pipes.length == 0 ||
      pipes[pipes.length - 1].x < width - PIPE_WIDTH - 100
    ) {
      pipes.push(new Pipe());
    }
  }
}

function updatePipes() {
  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].show();
    pipes[i].update();

    if (pipes[i].isOffscreen()) {
      pipes.splice(i, 1);
      continue; // Skip the rest of the loop for this iteration
    }

    if (bird.hits(pipes[i])) {
      pipes[i].changeColor(true);
      score = 0; // Reset score to zero
    } else {
      pipes[i].changeColor(false);
    }

    if (pipes[i].passed(bird) && !pipes[i].scored) {
      score++; // Increment score when bird passes a pipe
      pipes[i].scored = true; // Prevent further score increments for this pipe
    }
  }
}

function updateBird() {
  bird.show();
  bird.update();
}

function mousePressed() {
  if (mouseButton === LEFT) {
    bird.up();
  }
}

function touchStarted() {
  // Allow tapping anywhere on the screen to move the bird
  bird.up();
  return false; // Prevent default behavior
}

function Bird() {
  this.y = height / 2;
  this.x = windowWidth / 3;
  this.diameter = BIRD_DIAMETER;
  this.radius = this.diameter / 2;
  this.velocity = 0;

  this.show = function () {
    fill(255);
    ellipse(this.x, this.y, this.diameter, this.diameter);
  };

  this.update = function () {
    this.velocity += GRAVITY;
    this.y += this.velocity;
    this.adjustPositionForHeight();
  };

  this.adjustPositionForHeight = function () {
    if (this.y > height - this.diameter) {
      // Adjust for full bird visibility
      this.y = height - this.diameter; // Position the bird so the bottom edge is at the floor
      this.velocity = 0;
    }

    if (this.y < this.radius) {
      this.y = this.radius;
      this.velocity = 0;
    }
  };

  this.up = function () {
    this.velocity += LIFT;
  };

  this.hits = function (pipe) {
    let halfBirdSize = this.diameter / 2;
    if (
      this.y - halfBirdSize < pipe.top ||
      this.y + halfBirdSize > height - pipe.bottom
    ) {
      if (
        this.x + halfBirdSize > pipe.x &&
        this.x - halfBirdSize < pipe.x + pipe.width
      ) {
        return true;
      }
    }
    return false;
  };
}

window.addEventListener(
  "contextmenu",
  function (e) {
    e.preventDefault();
  },
  false
);

function Pipe() {
  // Calculate the spacing based on the current score
  let baseSpacing = map(score, 0, 100, 500, 150); // Increase the base spacing to make the game easier
  let scoreFactor = Math.floor(score / 5); // Calculate the score factor
  this.spacing = baseSpacing - scoreFactor * 50; // Decrease the spacing substantially every 5 points

  // Add some randomness to the opening
  this.spacing += random(-10, 10);

  this.top = random(height / 6, (4 / 6) * height);
  this.bottom = height - (this.top + this.spacing);
  this.x = width;
  this.width = PIPE_WIDTH;

  // Increase the speed based on the current score
  this.speed = PIPE_SPEED + scoreFactor * 0.1; // Increase the speed every 10 points

  this.color = color(255); // default color
  this.stroke = color(0); // default stroke
  this.scored = false; // Flag to track if score has been incremented for this pipe

  this.show = function () {
    fill(this.color);
    stroke(this.stroke);
    rect(this.x, 0, this.width, this.top);
    rect(this.x, height - this.bottom, this.width, this.bottom);
  };

  this.update = function () {
    this.x -= this.speed;
  };

  this.isOffscreen = function () {
    return this.x < -this.width;
  };

  this.changeColor = function (isHit) {
    if (isHit) {
      this.color = color(0); // black
      this.stroke = color(255); // white
    } else {
      this.color = color(255); // white
      this.stroke = color(0); // black
    }
  };

  this.passed = function (bird) {
    if (bird.x > this.x + this.width) {
      return true;
    }
    return false;
  };
}
