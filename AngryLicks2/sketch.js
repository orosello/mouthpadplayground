let ground;
let box;
let bird;
let world, engine;

function setup() {
  createCanvas(600, 400);
  engine = Matter.engine.create();
  world = engine.world;

  ground = new Box(0, height - 20, width, 20);
  box = new Box(400, 300, 30, 60);
  bird = new Bird(100, 300, 30);
}

function draw() {
  background(0);
  ground.show();
  box.show();
  bird.show();
}
