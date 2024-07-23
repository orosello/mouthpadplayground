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

  // Toggle button for eraser and paintbrush
  toggleButton = createButton("Pick up eraser");
  toggleButton.mousePressed(toggleTool);

  // Styling the button
  toggleButton.class("custom-font"); // Apply the custom font class
  toggleButton.style("color", "white");
  toggleButton.style("background-color", "black");
  toggleButton.style("border", "2px solid white");
  toggleButton.style("z-index", "1000"); // Ensure button is on top of canvas
  toggleButton.style("font-size", "12px"); // Adjust font size to 12px
  toggleButton.style("padding", "10px 15px"); // Increased horizontal padding
  toggleButton.style("white-space", "nowrap"); // Prevent text wrapping
  toggleButton.style("min-width", "180px"); // Set a minimum width

  // Position the button after styling
  positionButton();

  currentRadius = random(40, 80);
  textFont(myFont); // Ensure the font is loaded and set
}

function positionButton() {
  toggleButton.position(windowWidth - 280, 30); // Fixed position with 20px margin to the right
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
      "Click and drag to paint!",
      windowWidth / 2,
      windowHeight - BOTTOM_TEXT_Y_OFFSET
    );
  }

  // Define the safe area dimensions around the button
  const safeAreaX = windowWidth - SAFE_AREA_WIDTH; // Adjust width for safe area around the button
  const safeAreaY = 0; // Start from the top of the window

  // Check if the mouse is within the safe area
  const isInSafeArea =
    mouseX >= safeAreaX &&
    mouseX <= safeAreaX + SAFE_AREA_WIDTH &&
    mouseY >= safeAreaY &&
    mouseY <= safeAreaY + SAFE_AREA_HEIGHT;

  if (mouseIsPressed && !isInSafeArea) {
    isDrawing = true;
    pg.fill(isEraser ? 0 : 255); // Use background color if eraser is selected
    pg.noStroke();
    pg.circle(mouseX, mouseY, currentRadius);

    // Generate new radius for next paint
    currentRadius = random(60, 80);
  } else {
    isDrawing = false;
    // Draw preview circle
    push();
    noFill();
    stroke(255);
    strokeWeight(1);
    circle(mouseX, mouseY, currentRadius);
    pop();
  }
}

function toggleTool() {
  isEraser = !isEraser;
  toggleButton.html(isEraser ? "Pick up paintbrush" : "Pick up eraser");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pg.resizeCanvas(windowWidth, windowHeight); // Resize the off-screen buffer
  background(0);
  positionButton(); // Ensure button stays in top right corner with 20px padding
}

function mouseReleased() {
  isDrawing = false;
}
