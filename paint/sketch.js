const BOTTOM_TEXT_Y_OFFSET = 100;
const FONT_SIZE = 16;
const SAFE_AREA_WIDTH = 160;
const SAFE_AREA_HEIGHT = 50;
const BRUSH_WIDTH = 40; // Set a constant brush width

let myFont;
let showInstructions = true; // This should ensure instructions are shown initially
let isEraser = false; // Track if the eraser is selected
let currentRadius;
let isDrawing = false;

let mainCanvas;
let pg; // Off-screen graphics buffer

let prevX, prevY; // Add these variables to store the previous mouse position

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
  toggleButton = createButton("Eraser");
  toggleButton.mousePressed(toggleTool);

  // Clear button
  clearButton = createButton("Clear");
  clearButton.mousePressed(() => window.location.reload());

  // Styling the buttons
  [toggleButton, clearButton].forEach((button) => {
    button.class("custom-font");
    button.style("color", "white");
    button.style("background-color", "black");
    button.style("border", "2px solid white");
    button.style("z-index", "1000");
    button.style("font-size", "12px");
    button.style("padding", "10px 15px");
    button.style("white-space", "nowrap");
    button.style("width", "150px"); // Increased width by 20px
    button.style("text-align", "center");
  });

  // Position the buttons
  positionButtons();

  currentRadius = BRUSH_WIDTH;
  textFont(myFont); // Ensure the font is loaded and set

  prevX = null;
  prevY = null;
}

function positionButtons() {
  const buttonMargin = 30; // Margin between the buttons
  const buttonWidth = 150; // Width of the buttons

  // Position the buttons near the top right edge
  toggleButton.position(windowWidth - buttonWidth - buttonMargin, 10);
  clearButton.position(
    windowWidth - buttonWidth - buttonMargin,
    10 + buttonMargin + toggleButton.height
  );
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
    pg.strokeWeight(BRUSH_WIDTH);
    pg.stroke(isEraser ? 0 : 255);
    pg.noFill();

    if (prevX !== null && prevY !== null) {
      pg.line(prevX, prevY, mouseX, mouseY);
    }

    prevX = mouseX;
    prevY = mouseY;
  } else {
    isDrawing = false;
    prevX = null;
    prevY = null;
    // Draw preview circle
    push();
    noFill();
    stroke(255);
    strokeWeight(1);
    circle(mouseX, mouseY, BRUSH_WIDTH);
    pop();
  }
}

function toggleTool() {
  isEraser = !isEraser;
  toggleButton.html(isEraser ? "Paintbrush" : "Eraser");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pg.resizeCanvas(windowWidth, windowHeight); // Resize the off-screen buffer
  background(0);
  positionButtons(); // Ensure buttons stay in the correct position
}

function mouseReleased() {
  isDrawing = false;
  prevX = null;
  prevY = null;
}
