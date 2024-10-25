let circleRadius = 250;
let bubble1;
let myFont;
let showInstruction = true;
let showAwesomeText = false;
let isMobile = false;
let lastTouchTime = 0;
const DOUBLE_TAP_DELAY = 300;

function preload() {
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("game-container");

  // Check if device is mobile
  isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Adjust circle size based on screen size
  const smallerDimension = min(windowWidth, windowHeight);
  circleRadius = smallerDimension * 0.3;

  // Initialize bubble at screen center
  bubble1 = new Bubble(windowWidth / 2, windowHeight / 2, circleRadius);

  // Set up text properties
  textFont(myFont);
  textSize(isMobile ? 14 : 16);
  textAlign(CENTER);

  // Set up navbar and canvas event handlers
  setupEventHandlers();
}

function setupEventHandlers() {
  // Set up navbar event handlers
  const navbar = document.getElementById("navbar-container");

  const navbarEvents = [
    "mousedown",
    "mouseup",
    "touchstart",
    "touchend",
    "click",
  ];
  navbarEvents.forEach((eventType) => {
    navbar.addEventListener(
      eventType,
      (e) => {
        e.stopPropagation();
        e.preventDefault();
      },
      { passive: false }
    );
  });

  // Set up canvas event handlers with proper touch handling
  const canvasElement = document.querySelector("canvas");
  canvasElement.addEventListener("touchstart", handleCanvasTouch, {
    passive: false,
  });
  canvasElement.addEventListener("touchend", handleCanvasTouchEnd, {
    passive: false,
  });
}

function handleCanvasTouch(e) {
  e.preventDefault();

  // Return early if touch is on navbar
  if (
    e.touches.length > 0 &&
    checkNavbarClick(e.touches[0].clientX, e.touches[0].clientY)
  ) {
    return;
  }

  const currentTime = millis();
  if (currentTime - lastTouchTime < DOUBLE_TAP_DELAY) {
    mouseButton = RIGHT;
  } else {
    mouseButton = LEFT;
  }
  lastTouchTime = currentTime;

  if (e.touches.length > 0) {
    const rect = e.target.getBoundingClientRect();
    mouseX = e.touches[0].clientX - rect.left;
    mouseY = e.touches[0].clientY - rect.top;
    bubble1.mouseIsPressed = true;
  }
}

function handleCanvasTouchEnd(e) {
  e.preventDefault();

  if (mouseButton === LEFT) {
    showAwesomeText = true;
    setTimeout(() => {
      showAwesomeText = false;
    }, 1000);
  }

  bubble1.mouseIsPressed = false;
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
  if (!isMobile && !checkNavbarClick(mouseX, mouseY)) {
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
  textSize(isMobile ? 14 : 16);
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

function checkNavbarClick(x, y) {
  const navbar = document.getElementById("navbar-container");
  if (!navbar) return false;

  const rect = navbar.getBoundingClientRect();
  const buffer = 10; // Adding a small buffer for easier clicking
  return (
    x >= rect.left - buffer &&
    x <= rect.right + buffer &&
    y >= rect.top - buffer &&
    y <= rect.bottom + buffer
  );
}
