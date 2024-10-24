let circleRadius = 250;
let bubble1;
let myFont;
let showInstruction = true;
let showAwesomeText = false;
let isMobile = false;

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

  // Adjust the circle radius to fit within the screen with a maximum size
  const maxRadius = 250;
  circleRadius = min(min(windowWidth, windowHeight) / 2 - 10, maxRadius);

  let x = windowWidth / 2;
  let y = windowHeight / 2;
  let r = circleRadius;
  bubble1 = new Bubble(x, y, r);

  // Prevent the context menu from opening on right click
  canvas.oncontextmenu = function (e) {
    e.preventDefault();
  };

  // Add touch event listeners for mobile
  if (isMobile) {
    canvas.addEventListener("touchstart", handleTouch, false);
    canvas.addEventListener("touchend", handleTouchEnd, false);
  }

  textFont(myFont);
  textSize(16);
  textAlign(CENTER);
  showInstruction = true;
}

function handleTouch(event) {
  // Prevent default touch behavior
  event.preventDefault();

  // Get touch coordinates
  const touch = event.touches[0];
  // Update p5.js mouseX and mouseY
  mouseX = touch.clientX;
  mouseY = touch.clientY;

  // Simulate left mouse button press
  mouseButton = LEFT;
  bubble1.mouseIsPressed = true;
}

function handleTouchEnd(event) {
  event.preventDefault();
  bubble1.mouseIsPressed = false;

  // Show "Awesome!" text on touch release
  showAwesomeText = true;
  setTimeout(() => {
    showAwesomeText = false;
  }, 1000);
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
    text("Woops! That's a right click", windowWidth / 2, windowHeight - 50);
    showInstruction = false;
  }

  if (showInstruction) {
    noStroke();
    fill(255);
    const instructionText = isMobile
      ? "Tap the circle"
      : "To click, press your tongue flat\nagainst the roof of your mouth";

    if (isMobile) {
      text(instructionText, windowWidth / 2, windowHeight - 50);
    } else {
      text(
        "To click, press your tongue flat",
        windowWidth / 2,
        windowHeight - 70
      );
      text(
        "against the roof of your mouth",
        windowWidth / 2,
        windowHeight - 50
      );
    }
  }
}

function mousePressed() {
  if (!isMobile && (mouseButton === LEFT || mouseButton === RIGHT)) {
    bubble1.mouseIsPressed = true;
  }
}

function mouseReleased() {
  if (!isMobile) {
    if (mouseButton === LEFT || mouseButton === RIGHT) {
      bubble1.mouseIsPressed = false;
    }

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
  const maxRadius = 200;
  circleRadius = min(min(windowWidth, windowHeight) / 2 - 10, maxRadius);
  bubble1.x = windowWidth / 2;
  bubble1.y = windowHeight / 2;
  bubble1.r = circleRadius;
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
    let d = dist(mouseX, mouseY, this.x, this.y);
    return d < this.r;
  }
}
