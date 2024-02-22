const { Engine, World, Bodies, Mouse, MouseConstraint, Constraint } = Matter;

let ground;
const boxes = [];
let bird;
let world, engine;
let mConstraint;
let slingshot;
let birdLaunched = false;
let birdStopped = false;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  engine = Engine.create();
  world = engine.world;
  ground = new Ground(width / 2, height - 10, width, 20);

  let birdStartPositionY = windowHeight - windowHeight / 4;
  let birdStartPositionX = 150;
  let towerStartX = 450;
  let distanceToRightEdge = windowWidth - towerStartX;


  let spacing = distanceToRightEdge / 4;

  // Loop to create 3 towers
  for (let j = 0; j < 3; j++) {
    let numberOfBoxes = Math.floor(Math.random() * 3) + 4; // 4 to 6 boxes
    let currentTowerX = towerStartX + j * spacing;
    for (let i = 0; i < numberOfBoxes; i++) {
      let randomDisplacement = Math.floor(Math.random() * 11) - 5;
      boxes.push(
        new Box(currentTowerX + randomDisplacement, 300 - i * 75, 84, 100)
      );
    }
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
    birdLaunched = true;
  }, 100);
}

function draw() {
  background(0);
  Matter.Engine.update(engine);
  ground.show();
  for (let box of boxes) {
    box.show();
  }
  slingshot.show();
  bird.show();

  if (birdLaunched && !birdStopped) {
    // Check if the bird has stopped moving
    if (
      Math.abs(bird.body.velocity.x) < 0.01 &&
      Math.abs(bird.body.velocity.y) < 0.01
    ) {
      birdStopped = true;
      setTimeout(resetGame, 2000); // Wait 2 secs before resetting the game
    }
  }
}

function resetGame() {
  World.remove(world, bird.body);
  let birdStartPositionY = windowHeight - windowHeight / 4;
  let birdStartPositionX = 150;
  bird = new Bird(birdStartPositionX, birdStartPositionY, 25);
  slingshot.attach(bird.body);
  birdLaunched = false;
  birdStopped = false;
}
