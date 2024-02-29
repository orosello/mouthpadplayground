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
let fastestTime = Infinity;
let newFastestFlag = false;
let textColor; // Initial text color set to dark gray
let targetTextColor; // Target text color, starts as dark gray

// Colors and font will be initialized in setup()
let INITIAL_COLOR, HOVER_COLOR, TARGET_COLOR, ledFont;

class Square {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = SQUARE_SIZE;
    this.color = INITIAL_COLOR;
    this.isTarget = false;
  }

  update() {
    this.targetColor = this.getTargetColor();
    this.color = lerpColor(this.color, this.targetColor, 0.1);
    this.size = lerp(this.size, this.isMouseOver() ? SQUARE_SIZE + GAP_SIZE : SQUARE_SIZE, 0.1);
  }

  getTargetColor() {
    if (this.isMouseOver()) return HOVER_COLOR;
    if (this.isTarget) return TARGET_COLOR;
    return INITIAL_COLOR;
  }

  isMouseOver() {
    return mouseX >= this.x - this.size / 2 && mouseX <= this.x + this.size / 2 &&
      mouseY >= this.y - this.size / 2 && mouseY <= this.y + this.size / 2;
  }

  draw() {
    fill(this.color);
    rect(this.x, this.y, this.size, this.size, 10);
  }

  makeTarget() {
    this.isTarget = true;
    startTime = millis();
  }

  clearTarget() {
    this.isTarget = false;
  }
}

function preload() {
  ledFont = loadFont('../assets/led-counter-7/led_counter-7.ttf', fontLoaded, fontError);
}

function fontLoaded() {
  console.log('Font loaded successfully.');
}

function fontError(err) {
  console.error('Font failed to load', err);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  textFont(ledFont, TEXT_SIZE);
  textAlign(LEFT);

  INITIAL_COLOR = color(30);
  HOVER_COLOR = color(100);
  TARGET_COLOR = color(128, 0, 128);
  textColor = color(90); // Base text color changed to 150
  targetTextColor = color(90); // Base target text color changed to 150

  initializeGrid();
}

function initializeGrid() {
  const totalGridWidth = GRID_SIZE * (SQUARE_SIZE + GAP_SIZE) - GAP_SIZE;
  const offsetX = (windowWidth - totalGridWidth) / 2 + SQUARE_SIZE / 2;
  const offsetY = (windowHeight - totalGridWidth) / 2 + SQUARE_SIZE / 2;

  squares = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      squares.push(new Square(offsetX + i * (SQUARE_SIZE + GAP_SIZE), offsetY + j * (SQUARE_SIZE + GAP_SIZE)));
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

  // Interpolate text color if a new fastest time has been achieved
  if (newFastestFlag) {
    textColor = lerpColor(textColor, targetTextColor, 0.05);
    if (textColor.levels[0] > 250) { // Assuming white is the target, adjust threshold as needed
      targetTextColor = color(100); // Change target back to dark gray
    } else if (textColor.levels[0] < 35 && targetTextColor.levels[0] == 100) { // When lerping back to gray
      newFastestFlag = false; // Reset flag when color is back to gray
    }
  }
}

function mousePressed() {
  if (targetSquare && targetSquare.isMouseOver()) {
    recordTime();
    targetSquare.clearTarget();
    selectNewTarget();
  }
}

function recordTime() {
  const currentTime = ((millis() - startTime) / 1000).toFixed(2);
  times.push(currentTime);
  if (parseFloat(currentTime) < fastestTime) {
    fastestTime = parseFloat(currentTime);
    newFastestFlag = true;
    textColor = color(255); // Set text color to white to highlight new fastest time
    targetTextColor = color(90); // Set target text color back to dark gray for transition
  }
}

function selectNewTarget() {
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
  const fastestTimeDisplay = relevantTimes.length > 0 ? Math.min(...relevantTimes.map(time => parseFloat(time))) : 0;

  // Calculate the position to the right of the grid, separated by the width of 3 squares and 2 gaps
  const textX = (GRID_SIZE * (SQUARE_SIZE + GAP_SIZE)) + (3 * SQUARE_SIZE) + (15 * GAP_SIZE);

  fill(textColor); // Use the interpolated text color

  // Adjust the spacing between the texts
  const padding = 5; // Reduced padding for closer text

  const yDisp = SQUARE_SIZE * 2 + GAP_SIZE * 1;

  // Fastest Time
  textSize(SQUARE_SIZE / 2); // Set text size for times
  text(`${fastestTimeDisplay.toFixed(2)}`, textX, offsetY + yDisp); // Position at the top of the third row
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initializeGrid();
}
