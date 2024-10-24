let circleRadius = 250;
let bubble1;
let myFont;
let showInstruction = true;
let showAwesomeText = false;
let isMobile = false;
let lastTouchTime = 0;
const DOUBLE_TAP_DELAY = 300; // milliseconds between taps to count as double-tap

function preload() {
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Check if device is mobile
  isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Adjust circle size based on screen size
  const smallerDimension = min(windowWidth, windowHeight);
  circleRadius = smallerDimension * 0.3; // Make circle 30% of smaller screen dimension

  // Initialize bubble at screen center
  bubble1 = new Bubble(windowWidth / 2, windowHeight / 2, circleRadius);

  // Prevent default touch behaviors
  const canvas = document.querySelector("canvas");
  canvas.addEventListener(
    "touchstart",
    function (e) {
      e.preventDefault();
    },
    { passive: false }
  );

  canvas.addEventListener(
    "touchmove",
    function (e) {
      e.preventDefault();
    },
    { passive: false }
  );

  // Set up text properties
  textFont(myFont);
  textSize(isMobile ? 14 : 16); // Smaller text on mobile
  textAlign(CENTER);
}

function touchStarted() {
  const currentTime = millis();

  // Handle double-tap (simulates right-click on mobile)
  if (currentTime - lastTouchTime < DOUBLE_TAP_DELAY) {
    mouseButton = RIGHT;
  } else {
    mouseButton = LEFT;
  }

  lastTouchTime = currentTime;

  // Update touch position
  if (touches.length > 0) {
    mouseX = touches[0].x;
    mouseY = touches[0].y;
  }

  bubble1.mouseIsPressed = true;
  return false; // Prevent default
}

function touchEnded() {
  if (mouseButton === LEFT) {
    showAwesomeText = true;
    setTimeout(() => {
      showAwesomeText = false;
    }, 1000);
  }

  bubble1.mouseIsPressed = false;
  return false; // Prevent default
}

function draw() {
  background(0);
  bubble1.show();

  if (showAwesomeText) {
    noStroke();
    fill(255);
    text("Awesome!", windowWidth / 2, windowHeight - 50);
    showInstruction = false;
  }

  if (bubble1.mouseIsPressed && mouseButton === RIGHT) {
    noStroke();
    fill(255);
    text("Double-tap detected!", windowWidth / 2, windowHeight - 50);
    showInstruction = false;
  }

  if (showInstruction) {
    noStroke();
    fill(255);
    const instructionText = isMobile
      ? "Tap the circle\nDouble-tap for alternative action"
      : "To click, press your tongue flat\nagainst the roof of your mouth";

    const yOffset = isMobile ? 70 : 50;
    const lines = instructionText.split("\n");
    lines.forEach((line, i) => {
      text(line, windowWidth / 2, windowHeight - yOffset + i * 20);
    });
  }
}

function mousePressed() {
  if (!isMobile) {
    bubble1.mouseIsPressed = true;
  }
}

function mouseReleased() {
  if (!isMobile) {
    bubble1.mouseIsPressed = false;
    if (mouseButton === LEFT) {
      showAwesomeText = true;
      setTimeout(() => {
        showAwesomeText = false;
      }, 1000);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  const smallerDimension = min(windowWidth, windowHeight);
  circleRadius = smallerDimension * 0.3;
  bubble1.x = windowWidth / 2;
  bubble1.y = windowHeight / 2;
  bubble1.r = circleRadius;
  textSize(isMobile ? 14 : 16); // Adjust text size on resize
}

class Bubble {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.mouseIsPressed = false;
  }

  show() {
    if (this.mouseIsPressed) {
      fill(0);
      stroke(255);
    } else if (this.isMouseOver()) {
      fill(255);
      stroke(255);
      strokeWeight(10);
    } else {
      fill(255);
      noStroke();
    }
    circle(this.x, this.y, this.r * 2);
  }

  isMouseOver() {
    let d;
    if (isMobile && touches.length > 0) {
      d = dist(touches[0].x, touches[0].y, this.x, this.y);
    } else {
      d = dist(mouseX, mouseY, this.x, this.y);
    }
    return d < this.r;
  }
}
