const BOTTOM_TEXT_Y_OFFSET = 50;
const FONT_SIZE = 16;

let randomCircleRadius = 0;
let myFont;
let showInstructions = true; // This should ensure instructions are shown initially

function preload() {
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);
  background(0);

  // Disable right-click context menu
  canvas = document.querySelector("canvas");
  canvas.oncontextmenu = function (e) {
    e.preventDefault();
  };

  // Event listener for mouse click to hide instructions
  canvas.addEventListener("mousedown", function () {
    showInstructions = false;
  });
}

function draw() {
  if (showInstructions) {
    // Set text properties
    textFont(myFont);
    textSize(FONT_SIZE);
    textAlign(CENTER);
    fill(255);

    // Display instructions
    text(
      "Click and drag to paint!",
      windowWidth / 2,
      windowHeight - BOTTOM_TEXT_Y_OFFSET
    );
  }

  if (mouseIsPressed) {
    randomCircleRadius = 70;

    fill(255);
    strokeWeight(1);
    rectMode(CENTER);
    circle(mouseX, mouseY, randomCircleRadius);
  }

  // Display instructions if the flag is true
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}
