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
  let birdStartPositionX = 150; // You can adjust this based on your preference

  // Define the starting X position for the first tower
  let towerStartX = 450;
  // Calculate the distance between the first tower and the right edge of the screen
  let distanceToRightEdge = windowWidth - towerStartX;

  // Calculate the spacing between towers and the right edge
  let spacing = distanceToRightEdge / 4; // Dividing by 4 to get 3 spaces for towers and 1 at the end

  // Loop to create 3 towers
  for (let j = 0; j < 3; j++) {
    // Calculate the number of boxes in each tower (randomly between 4 and 6)
    let numberOfBoxes = Math.floor(Math.random() * 3) + 4; // 4 to 6 boxes
    // Calculate the X position for the current tower
    let currentTowerX = towerStartX + j * spacing;
    // Loop to create each box in the tower
    for (let i = 0; i < numberOfBoxes; i++) {
      // Generate a random displacement between -5 and 5
      let randomDisplacement = Math.floor(Math.random() * 11) - 5;
      // Apply the displacement to the X position of each box
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
    birdLaunched = true; // Set birdLaunched to true when the bird is launched
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
      birdStopped = true; // Mark the bird as stopped
      setTimeout(resetGame, 2000); // Wait 2 seconds before resetting the game
    }
  }
}

function resetGame() {
  World.remove(world, bird.body);
  let birdStartPositionY = windowHeight - windowHeight / 4;
  let birdStartPositionX = 150;
  bird = new Bird(birdStartPositionX, birdStartPositionY, 25);
  slingshot.attach(bird.body);
  birdLaunched = false; // Reset the birdLaunched flag
  birdStopped = false; // Reset the birdStopped flag
}
