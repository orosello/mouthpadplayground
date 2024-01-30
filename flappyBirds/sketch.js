let bird;
let pipes = [];
let gravity = 0.6;
let lift = -15;
let score = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  bird = new Bird();
  pipes.push(new Pipe());
}

function draw() {
  background(0);

  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].show();
    pipes[i].update();

    if (pipes[i].offscreen()) {
      pipes.splice(i, 1);
    }
  }

  bird.show();
  bird.update();

  if (frameCount % 150 == 0) {
    // Increased the distance between pipes
    pipes.push(new Pipe());
    score++;
  }

  fill(255);
  textSize(32);
  text("Score: " + score, 10, 50);
}

function mousePressed() {
  if (mouseButton === LEFT) {
    bird.up();
  }
}

function Bird() {
  this.y = height / 2;
  this.x = windowWidth / 3; // Bird is positioned at the first third of the screen's width
  this.diameter = 64;
  this.radius = this.diameter / 2;
  this.velocity = 0;

  this.show = function () {
    fill(255);
    ellipse(this.x, this.y, this.diameter, this.diameter); // Increased size of bird
  };

  this.update = function () {
    this.velocity += gravity;
    this.y += this.velocity;

    if (this.y > height - this.radius) {
      // Adjusted for bird's height
      this.y = height - this.radius;
      this.velocity = 0;
    }

    if (this.y < this.radius) {
      // Adjusted for bird's height
      this.y = this.radius;
      this.velocity = 0;
    }
  };

  this.up = function () {
    this.velocity += lift;
  };
}

// Disable right click
window.addEventListener(
  "contextmenu",
  function (e) {
    e.preventDefault();
  },
  false
);

function Pipe() {
  this.spacing = map(score, 0, 100, 250, 150); // Increased the gap between the top and bottom parts of each pipe
  this.top = random(height / 6, (4 / 6) * height);
  this.bottom = height - (this.top + this.spacing);
  this.x = width;
  this.w = 30; // Halved the width of the pipes
  this.speed = 2;

  this.show = function () {
    fill(255);
    rect(this.x, 0, this.w, this.top);
    rect(this.x, height - this.bottom, this.w, this.bottom);
  };

  this.update = function () {
    this.x -= this.speed;
  };

  this.offscreen = function () {
    return this.x < -this.w;
  };
}
