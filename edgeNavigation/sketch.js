class Circle {
  constructor(x, y, targetX, targetY) {
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.filled = false;
  }

  animate() {
    this.x += (this.targetX - this.x) * 0.05;
    this.y += (this.targetY - this.y) * 0.05;
    return dist(this.x, this.y, this.targetX, this.targetY) < 1;
  }

  checkMouseOver() {
    if (dist(mouseX, mouseY, this.x, this.y) < 25) {
      this.filled = true;
    }
  }

  draw() {
    fill(this.filled ? 255 : 0);
    stroke(255);
    ellipse(this.x, this.y, 50);
  }
}

let circles = [];
let stage = 0;
let animating = false;
let myFont;
let firstTimeStage = [true, true];

function preload() {
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  setStage();

  textFont(myFont);
  textSize(16);
  textAlign(CENTER, CENTER);

  // Prevent the default right-click context menu
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
}

function setStage() {
  circles = [];
  let positions = stage === 0 ? getStage0Positions() : getStage1Positions();
  positions.forEach((pos) =>
    circles.push(new Circle(pos.x, pos.y, pos.targetX, pos.targetY))
  );
  animating = true;
}

function getStage0Positions() {
  return [
    { x: 60, y: 60, targetX: windowWidth / 2, targetY: 60 },
    {
      x: windowWidth - 60,
      y: 60,
      targetX: windowWidth - 60,
      targetY: windowHeight / 2,
    },
    {
      x: windowWidth - 60,
      y: windowHeight - 120, // Adjusted to ensure visibility
      targetX: windowWidth / 2,
      targetY: windowHeight - 120, // Adjusted to ensure visibility
    },
    { x: 60, y: windowHeight - 120, targetX: 60, targetY: windowHeight / 2 }, // Adjusted to ensure visibility
  ];
}

function getStage1Positions() {
  return [
    { x: windowWidth / 2, y: 60, targetX: 60, targetY: 60 },
    {
      x: windowWidth - 60,
      y: windowHeight / 2,
      targetX: windowWidth - 60,
      targetY: 60,
    },
    {
      x: windowWidth / 2,
      y: windowHeight - 120, // Adjusted to ensure visibility
      targetX: windowWidth - 60,
      targetY: windowHeight - 120, // Adjusted to ensure visibility
    },
    { x: 60, y: windowHeight / 2, targetX: 60, targetY: windowHeight - 120 }, // Adjusted to ensure visibility
  ];
}

function draw() {
  background(0);

  noStroke();
  fill(255);
  let message = getMessage();
  text(message, windowWidth / 2, windowHeight / 2);

  circles.forEach((circle) => {
    if (animating) {
      animating = !circle.animate();
    } else {
      circle.checkMouseOver();
    }
    circle.draw();
  });

  if (circles.every((circle) => circle.filled) && !animating) {
    firstTimeStage[stage] = false;
    stage = (stage + 1) % 2;
    setStage();
  }
}

function getMessage() {
  if (stage === 0 && firstTimeStage[0]) {
    return "Move the cursor to the circles";
  } else if (stage === 1 && firstTimeStage[1]) {
    return "Great job!";
  } else {
    return "";
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setStage();
}
