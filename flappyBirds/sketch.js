const GRAVITY = 0.6;
const LIFT = -15;
const PIPE_WIDTH = 30;
const PIPE_SPEED = 2;
const BIRD_DIAMETER = 64;

let bird;
let pipes = [];
let score = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  bird = new Bird();
  pipes.push(new Pipe());
}

function draw() {
  background(0);
  updatePipes();
  updateBird();
  displayScore();

  // EDIT for game difficulty
  // Calculate the pipe frequency based on the current score
  let baseFrequency = 300; // Increase the base frequency to make the game easier
  let scoreFactor = Math.floor(score / 5); // Calculate the score factor
  let frequency = baseFrequency - scoreFactor * 50; // Decrease the frequency substantially every 5 points

  // Generate a new pipe based on the calculated frequency
  if (frameCount % frequency == 0) {
    pipes.push(new Pipe());
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

function displayScore() {
  fill(255);
  textSize(32);
  text(`Score: ${score}`, 10, 50);
}

function mousePressed() {
  if (mouseButton === LEFT) {
    bird.up();
  }
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
    if (this.y > height - this.radius) {
      this.y = height - this.radius;
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
  //EDIT for game difficulty
  // This line maps the score (which ranges from 0 to 100) to a base spacing value (which ranges from 400 to 150).
  // As the score increases, the base spacing decreases, making the game more difficult.
  let baseSpacing = map(score, 0, 100, 500, 150);
  let scoreFactor = Math.floor(score / 5); // Calculate the score factor
  this.spacing = baseSpacing - scoreFactor * 80; // Decrease the spacing substantially every 5 points

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
