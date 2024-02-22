const { Engine, World, Bodies, Mouse, MouseConstraint, Constraint } = Matter;

let ground;
const boxes = [];
let bird;
let world, engine;
let mConstraint;
let slingshot;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  engine = Engine.create();
  world = engine.world;
  ground = new Ground(width / 2, height - 10, width, 20);

  let birdStartPositionY = windowHeight - windowHeight / 4;
  let birdStartPositionX = 150; // You can adjust this based on your preference

  for (let i = 0; i < 5; i++) {
    boxes[i] = new Box(450, 300 - i * 75, 84, 100);
  }

  bird = new Bird(birdStartPositionX, birdStartPositionY, 25);

  slingshot = new SlingShot(birdStartPositionX, birdStartPositionY, bird.body);

  const mouse = Mouse.create(canvas.elt);
  const options = {
    mouse: mouse,
  };

  mouse.pixelRatio = pixelDensity();
  mConstraint = MouseConstraint.create(engine, options);
  World.add(world, mConstraint);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  ground = new Ground(width / 2, height - 10, width, 20);
}

function keyPressed() {
  if (key == " ") {
    World.remove(world, bird.body);
    let birdStartPositionY = windowHeight - windowHeight / 4;
    let birdStartPositionX = 150;
    bird = new Bird(birdStartPositionX, birdStartPositionY, 25);
    slingshot.attach(bird.body);
  }
}

function mouseReleased() {
  setTimeout(() => {
    slingshot.fly();
  }, 100);
}

function draw() {
  // background(bkgImg);
  background(0);
  Matter.Engine.update(engine);
  ground.show();
  for (let box of boxes) {
    box.show();
  }
  slingshot.show();
  bird.show();
}
