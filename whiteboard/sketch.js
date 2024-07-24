const BOTTOM_TEXT_Y_OFFSET = 50;
const FONT_SIZE = 16;
const SAFE_AREA_WIDTH = 160;
const SAFE_AREA_HEIGHT = 50;
const TRACE_WIDTH = 50; // Define a constant for the trace width
const TRACE_LIFETIME = 2000; // Trace lifetime in milliseconds

let randomCircleRadius = 0;
let myFont;
let showInstructions = true; // This should ensure instructions are shown initially
let isEraser = false; // Track if the eraser is selected
let currentRadius;
let isDrawing = false;

let mainCanvas;
let pg; // Off-screen graphics buffer

let prevMouseX, prevMouseY; // Variables to store previous mouse positions

let traces = []; // Array to store trace segments

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
  // Only clear the background if instructions are shown
  if (showInstructions) {
    background(0);
    image(pg, 0, 0); // Draw the off-screen buffer onto the main canvas

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

  // Clear the off-screen buffer
  pg.background(0);

  // Draw existing traces
  let currentTime = millis();
  traces = traces.filter((trace) => currentTime - trace.time < TRACE_LIFETIME);
  for (let trace of traces) {
    pg.stroke(255);
    pg.strokeWeight(TRACE_WIDTH);
    pg.line(trace.x1, trace.y1, trace.x2, trace.y2);
  }

  if (isDrawing) {
    // Add new trace segment
    traces.push({
      x1: prevMouseX,
      y1: prevMouseY,
      x2: mouseX,
      y2: mouseY,
      time: millis(),
    });

    // Draw the new trace segment directly
    pg.stroke(255);
    pg.strokeWeight(TRACE_WIDTH);
    pg.line(prevMouseX, prevMouseY, mouseX, mouseY);
  }

  // Draw the off-screen buffer onto the main canvas
  image(pg, 0, 0);

  if (!isDrawing) {
    // Draw preview circle on the main canvas
    push();
    noFill();
    stroke(255);
    strokeWeight(1);
    circle(mouseX, mouseY, TRACE_WIDTH);
    pop();
  }

  // Update previous mouse positions
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pg.resizeCanvas(windowWidth, windowHeight); // Resize the off-screen buffer
  background(0);
}

function mousePressed() {
  isDrawing = !isDrawing; // Toggle drawing mode
  if (isDrawing) {
    // Initialize previous mouse positions when starting to draw
    prevMouseX = mouseX;
    prevMouseY = mouseY;
  }
}
