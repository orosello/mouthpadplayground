let circles = [];
let filledCircles = 0;
let stage = 0;
let animating = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  setStage();

  // Prevent the default right-click context menu
  canvas.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });
}

function setStage() {
  filledCircles = 0;
  if (stage === 0) {
    circles = [
      { x: 60, y: 60, targetX: windowWidth / 2, targetY: 60, filled: false },
      {
        x: windowWidth - 60,
        y: 60,
        targetX: windowWidth - 60,
        targetY: windowHeight / 2,
        filled: false,
      },
      {
        x: windowWidth - 60,
        y: windowHeight - 60,
        targetX: windowWidth / 2,
        targetY: windowHeight - 60,
        filled: false,
      },
      {
        x: 60,
        y: windowHeight - 60,
        targetX: 60,
        targetY: windowHeight / 2,
        filled: false,
      },
    ];
  } else if (stage === 1) {
    circles = [
      { x: windowWidth / 2, y: 60, targetX: 60, targetY: 60, filled: false },
      {
        x: windowWidth - 60,
        y: windowHeight / 2,
        targetX: windowWidth - 60,
        targetY: 60,
        filled: false,
      },
      {
        x: windowWidth / 2,
        y: windowHeight - 60,
        targetX: windowWidth - 60,
        targetY: windowHeight - 60,
        filled: false,
      },
      {
        x: 60,
        y: windowHeight / 2,
        targetX: 60,
        targetY: windowHeight - 60,
        filled: false,
      },
    ];
  }
  animating = true;
}

function draw() {
  background(0);
  for (let circle of circles) {
    if (animating) {
      circle.x += (circle.targetX - circle.x) * 0.05;
      circle.y += (circle.targetY - circle.y) * 0.05;
      if (dist(circle.x, circle.y, circle.targetX, circle.targetY) < 1) {
        animating = false;
      }
    } else if (dist(mouseX, mouseY, circle.x, circle.y) < 25) {
      circle.filled = true;
    }
    fill(circle.filled ? 255 : 0);
    stroke(255);
    ellipse(circle.x, circle.y, 50);
  }

  filledCircles = circles.filter((c) => c.filled).length;
  if (filledCircles === 4 && !animating) {
    stage = (stage + 1) % 2;
    setStage();
  }
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setStage();
}
