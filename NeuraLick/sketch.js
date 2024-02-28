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

class Square {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = SQUARE_SIZE;
    this.color = INITIAL_COLOR;
    this.isTarget = false;
  }

  update() {
    // Update color based on mouse position and target status
    this.color = this.isMouseOver() ? HOVER_COLOR : INITIAL_COLOR;
    if (this.isTarget) {
      this.color = TARGET_COLOR;
    }
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
  textSize(TEXT_SIZE);
  textAlign(RIGHT, CENTER);

  // Initialize colors
  INITIAL_COLOR = color(30);
  HOVER_COLOR = color(100);
  TARGET_COLOR = color(128, 0, 128);

  initializeGrid();
}

function initializeGrid() {
  // Calculate starting positions
  const offsetX = (windowWidth - GRID_SIZE * (SQUARE_SIZE + GAP_SIZE) + GAP_SIZE) / 2;
  const offsetY = (windowHeight - GRID_SIZE * (SQUARE_SIZE + GAP_SIZE) + GAP_SIZE) / 2;

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
  // Display last, average, and fastest reaction times
  const lastTime = times[times.length - 1] || 0;
  // Skip the first measurement for the average and fastest time calculation
  const relevantTimes = times.slice(1);
  const averageTime = relevantTimes.length > 0 ? relevantTimes.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / relevantTimes.length : 0;
  const fastestTime = relevantTimes.length > 0 ? Math.min(...relevantTimes.map(time => parseFloat(time))) : 0;

  fill(255);
  text(`Last Time: ${lastTime}s`, windowWidth - 20, windowHeight / 2);
  text(`Avg Time: ${averageTime.toFixed(2)}s`, windowWidth - 20, windowHeight / 2 + 40);
  text(`Fastest Time: ${fastestTime.toFixed(2)}s`, windowWidth - 20, windowHeight / 2 + 80);
}