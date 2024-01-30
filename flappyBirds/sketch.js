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

  // Generate a new pipe every 100 frames
  if (frameCount % 100 == 0) {
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
  this.spacing = map(score, 0, 100, 250, 150);
  this.top = random(height / 6, (4 / 6) * height);
  this.bottom = height - (this.top + this.spacing);
  this.x = width;
  this.width = PIPE_WIDTH;
  this.speed = PIPE_SPEED;
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
