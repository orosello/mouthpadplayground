let Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies;

let engine;
let world;
let bubbles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  engine = Engine.create();
  world = engine.world;
  engine.world.gravity.y = 0; // Set initial gravity to 0
  document.addEventListener("contextmenu", (event) => event.preventDefault());
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (mouseButton === RIGHT) {
    engine.world.gravity.y = 2; // Increase gravity when right mouse button is pressed
  } else {
    engine.world.gravity.y = 0; // Reset gravity when left mouse button is pressed
    let r = 5;
    let b = new Bubble(mouseX, mouseY, r);
    bubbles.push(b);
  }
}

function mouseReleased() {
  if (mouseButton === RIGHT) {
    engine.world.gravity.y = 0; // Stop gravity when right mouse button is released
  }
}

function draw() {
  background(0);
  Engine.update(engine);

  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    b.move();
    b.show();
    if (b.isOffScreen()) {
      b.removeFromWorld();
      bubbles.splice(i, 1);
    }
  }
}

class Bubble {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    let options = {
      restitution: 0.8,
      friction: 0,
      density: 1, // Increase density of the bubbles
    };
    this.body = Bodies.circle(x, y, r, options);
    World.add(world, this.body);
  }

  move() {
    if (engine.world.gravity.y === 0) {
      this.body.position.x += random(-1, 1);
      this.body.position.y += random(-1, 1);
    }
  }

  show() {
    noStroke();
    fill(255);
    this.x = this.body.position.x;
    this.y = this.body.position.y;
    circle(this.x, this.y, this.r * 2);
  }

  isOffScreen() {
    let pos = this.body.position;
    return pos.y > height + 100;
  }

  removeFromWorld() {
    World.remove(world, this.body);
  }
}
