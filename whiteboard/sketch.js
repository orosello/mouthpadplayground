const BOTTOM_TEXT_Y_OFFSET = 50;
const FONT_SIZE = 16;
const SAFE_AREA_WIDTH = 160;
const SAFE_AREA_HEIGHT = 50;

let randomCircleRadius = 0;
let myFont;
let showInstructions = true; // This should ensure instructions are shown initially
let isEraser = false; // Track if the eraser is selected
let currentRadius;
let isDrawing = false;

let mainCanvas;
let pg; // Off-screen graphics buffer

function preload() {
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

function setup() {
  mainCanvas = createCanvas(windowWidth, windowHeight);
  pg = createGraphics(windowWidth, windowHeight); // Initialize the off-screen buffer
  colorMode(RGB);
  background(0);

  // Disable right-click context menu
  canvas = document.querySelector("canvas");
  canvas.oncontextmenu = (e) => e.preventDefault();

  // Event listener for mouse click to hide instructions
  canvas.addEventListener("mousedown", () => (showInstructions = false));

  // Add custom font to the document's head
  const style = document.createElement("style");
  style.innerHTML = `
    @font-face {
      font-family: 'Press Start 2P';
      src: url('../assets/Press_Start_2P/PressStart2P-Regular.ttf') format('truetype');
    }
    .custom-font {
      font-family: 'Press Start 2P', sans-serif;
    }
  `;
  document.head.appendChild(style);

  currentRadius = random(50, 50);
  textFont(myFont); // Ensure the font is loaded and set
}

function draw() {
  background(0); // Clear the background at the beginning of each frame
  image(pg, 0, 0); // Draw the off-screen buffer onto the main canvas

  if (showInstructions) {
    // Set text properties
    textFont(myFont);
    textSize(FONT_SIZE);
    textAlign(CENTER);
    fill(255);

    // Display instructions
    text(
      "Click to start painting. Click again to stop.",
      windowWidth / 2,
      windowHeight - BOTTOM_TEXT_Y_OFFSET
    );
  }

  if (isDrawing) {
    pg.fill(255); // Use white color for painting
    pg.noStroke();
    pg.circle(mouseX, mouseY, currentRadius);

    // Generate new radius for next paint
    currentRadius = random(60, 80);
  } else {
    // Draw preview circle
    push();
    noFill();
    stroke(255);
    strokeWeight(1);
    circle(mouseX, mouseY, currentRadius);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pg.resizeCanvas(windowWidth, windowHeight); // Resize the off-screen buffer
  background(0);
}

function mousePressed() {
  isDrawing = !isDrawing; // Toggle drawing mode
}
