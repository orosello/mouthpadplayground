// Matter.js module aliases
let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint;

let engine;
let ground;
let bird;
let boxes = [];
let mConstraint;
let slingshot;

function setup() {
  let canvas = createCanvas(710, 400);
  engine = Engine.create();
  ground = Bodies.rectangle(355, 390, width, 20, { isStatic: true });
  World.add(engine.world, [ground]);

  let canvasmouse = Mouse.create(canvas.elt);
  canvasmouse.pixelRatio = pixelDensity();
  let options = {
    mouse: canvasmouse
  };
  mConstraint = MouseConstraint.create(engine, options);
  World.add(engine.world, mConstraint);

  // Pre-place boxes with gaps and random sizes
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 6; j++) {
      let w = random(30, 65);
      let h = random(30, 65);
      boxes.push(new Box(400 + i * 60, 390 - j * h, w, h, 'rectangle')); // Boxes placed on the ground
    }
    boxes.push(new Box(400 + i * 60, 390 - 6 * 40, 10, 10, 'rectangle')); // Small box at the top of each tower
  }

  bird = Bodies.circle(150, 280, 20); // Moved launch position upwards
  // Check if bird is not within the bounding box of the structures
  if (bird.position.x < 400 || bird.position.x > 400 + 3 * 60 || bird.position.y > 390) {
    World.add(engine.world, bird);
  }

  slingshot = new SlingShot(150, 280, bird); // Moved launch position upwards
}

function mouseReleased() {
  setTimeout(() => {
    slingshot.fly();
  }, 100);
}

function draw() {
  background(0);
  Engine.update(engine);
  for (let box of boxes) {
    box.show();
  }
  slingshot.show();
  push();
  fill(255);
  rectMode(CENTER);
  rect(ground.position.x, ground.position.y, width, 20);
  ellipse(bird.position.x, bird.position.y, 20);
  pop();

  // Check if bird has stopped moving or is off screen
  let speed = Math.sqrt(bird.velocity.x * bird.velocity.x + bird.velocity.y * bird.velocity.y);
  if ((speed < 0.5 && slingshot.sling.bodyB === null) || bird.position.y > height || bird.position.x > width) {
    setTimeout(() => {
      World.remove(engine.world, bird);
      bird = Bodies.circle(150, 280, 20); // Moved launch position upwards
      World.add(engine.world, bird);
      slingshot.attach(bird);
    }, 1000);
  }
}

// Box class
class Box {
  constructor(x, y, w, h, shape) {
    this.body = Bodies.rectangle(x, y, w, h);
    this.w = w;
    this.h = h;
    World.add(engine.world, this.body);
  }

  show() {
    let pos = this.body.position;
    let angle = this.body.angle;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);
    if (this.w === 10 && this.h === 10) {
      stroke(255);
      fill(0);
    } else {
      fill(255);
    }
    rect(0, 0, this.w, this.h);
    pop();
  }
}

// SlingShot class
class SlingShot {
  constructor(x, y, body) {
    let options = {
      pointA: { x: x, y: y },
      bodyB: body,
      stiffness: 0.02,
      length: 60 // Made the rope longer
    };
    this.sling = Matter.Constraint.create(options);
    World.add(engine.world, this.sling);
  }

  fly() {
    this.sling.bodyB = null;
  }

  attach(body) {
    this.sling.bodyB = body;
  }

  show() {
    if (this.sling.bodyB) {
      stroke(255);
      line(this.sling.pointA.x, this.sling.pointA.y, this.sling.bodyB.position.x, this.sling.bodyB.position.y);
    }
  }
}