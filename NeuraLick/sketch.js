// Constants for UI
const SQUARE_SIZE = 120;
const GAP_SIZE = 10;
const GRID_SIZE = 6;
const TEXT_SIZE = 32;

// Global variables
let squares = [];
let targetSquare = null;
let startTime = 0;
let times = [];

// Colors will be initialized in setup()
let INITIAL_COLOR;
let HOVER_COLOR;
let TARGET_COLOR;

let ledFont; // Declare a variable for the font

function preload() {
  // Load the font; adjust the path to where you've stored your font file
  ledFont = loadFont('../assets/led-counter-7/led_counter-7.ttf');
}

class Square {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = SQUARE_SIZE;
    this.color = INITIAL_COLOR;
    this.targetColor = this.color; // Initialize targetColor
    this.isTarget = false;
  }

  update() {
    // Determine the target color based on mouse position and target status
    if (this.isMouseOver()) {
      this.targetColor = HOVER_COLOR;
    } else if (this.isTarget) {
      this.targetColor = TARGET_COLOR;
    } else {
      this.targetColor = INITIAL_COLOR;
    }

    // Animate color transition
    this.color = lerpColor(this.color, this.targetColor, 0.1);

    // Animate size for a hover effect
    this.size = lerp(this.size, this.isMouseOver() ? SQUARE_SIZE + GAP_SIZE : SQUARE_SIZE, 0.1);
  }

  isMouseOver() {
    // Check if the mouse is over this square
    return mouseX >= this.x - this.size / 2 && mouseX <= this.x + this.size / 2 &&
      mouseY >= this.y - this.size / 2 && mouseY <= this.y + this.size / 2;
  }

  draw() {
    // Draw the square with current color and size
    fill(this.color);
    rect(this.x, this.y, this.size, this.size, 10);
  }

  makeTarget() {
    // Mark as target and record start time
    this.isTarget = true;
    startTime = millis();
  }

  clearTarget() {
    // Clear target status
    this.isTarget = false;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  textFont(ledFont, TEXT_SIZE); // Apply the loaded font with the desired size
  textAlign(LEFT);

  // Initialize colors
  INITIAL_COLOR = color(30);
  HOVER_COLOR = color(100);
  TARGET_COLOR = color(128, 0, 128);

  initializeGrid();
}

function initializeGrid() {
  // Calculate the total grid width and height
  const totalGridWidth = GRID_SIZE * (SQUARE_SIZE + GAP_SIZE) - GAP_SIZE;
  const totalGridHeight = GRID_SIZE * (SQUARE_SIZE + GAP_SIZE) - GAP_SIZE;
  print(totalGridWidth, totalGridHeight);

  // Calculate starting positions to center the grid, adjusting offsetX and offsetY to shift the grid rightwards and downwards
  const offsetX = (windowWidth - totalGridWidth) / 2 + SQUARE_SIZE / 2; // Adjusted offsetX
  const offsetY = (windowHeight - totalGridHeight) / 2 + SQUARE_SIZE / 2; // Adjusted offsetY

  squares = []; // Clear previous squares to avoid duplicates when window is resized

  // Create grid of squares
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const x = offsetX + i * (SQUARE_SIZE + GAP_SIZE);
      const y = offsetY + j * (SQUARE_SIZE + GAP_SIZE);
      squares.push(new Square(x, y));
    }
  }
  selectNewTarget();
}

function draw() {
  background(0);
  squares.forEach(square => {
    square.update();
    square.draw();
  });
  displayTimes();
}

function mousePressed() {
  // Check if the target square is clicked
  if (targetSquare && targetSquare.isMouseOver()) {
    recordTime();
    targetSquare.clearTarget();
    selectNewTarget();
  }
}

function recordTime() {
  // Record reaction time
  let currentTime = (millis() - startTime) / 1000;
  times.push(currentTime.toFixed(2));
}

function selectNewTarget() {
  // Randomly select a new target square
  targetSquare = squares[floor(random(squares.length))];
  targetSquare.makeTarget();
}

function displayTimes() {
  // Recalculate offsetY to ensure it's defined in this scope
  const totalGridHeight = GRID_SIZE * (SQUARE_SIZE + GAP_SIZE) - GAP_SIZE;
  const offsetY = (windowHeight - totalGridHeight) / 2 + SQUARE_SIZE / 2; // Adjusted offsetY

  // Display last, average, and fastest reaction times
  const lastTime = times.length > 0 ? times[times.length - 1] : "0.00";
  const relevantTimes = times.slice(1);
  const averageTime = relevantTimes.length > 0 ? relevantTimes.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / relevantTimes.length : 0;
  const fastestTime = relevantTimes.length > 0 ? Math.min(...relevantTimes.map(time => parseFloat(time))) : 0;

  // Calculate the position to the right of the grid, separated by the width of 3 squares and 2 gaps
  const textX = (GRID_SIZE * (SQUARE_SIZE + GAP_SIZE)) + (3 * SQUARE_SIZE) + (15
    * GAP_SIZE);

  // Set the fill color to white (or any other color you prefer)
  fill(255);

  // Adjust the spacing between the texts
  const padding = 5; // Reduced padding for closer text

  const yDisp = SQUARE_SIZE * 2 + GAP_SIZE * 1;

  // Fastest Time
  textSize(SQUARE_SIZE / 2); // Set text size for times
  text(`${fastestTime.toFixed(2)}`, textX, offsetY + yDisp); // Position at the top of the third row
  textSize(SQUARE_SIZE / 6); // Smaller text size for description
  text("FASTEST", textX, offsetY + SQUARE_SIZE / 6 + yDisp); // Description for fastest time with reduced padding

  // Last Time
  textSize(SQUARE_SIZE / 2); // Reset text size for times
  text(`${lastTime}`, textX, offsetY + 90 + yDisp); // Adjusted for closer positioning
  textSize(SQUARE_SIZE / 6); // Smaller text size for description
  text("LAST", textX, offsetY + SQUARE_SIZE / 6 + 90 + yDisp); // Description for last time with reduced padding


  // Average Time
  textSize(SQUARE_SIZE / 2); // Reset text size for times
  text(`${averageTime.toFixed(2)}`, textX, offsetY + 180 + yDisp); // Adjusted for closer positioning
  textSize(SQUARE_SIZE / 6); // Smaller text size for description
  text("AVERAGE", textX, offsetY + SQUARE_SIZE / 6 + 180 + yDisp); // Description for last time with reduced padding





}
