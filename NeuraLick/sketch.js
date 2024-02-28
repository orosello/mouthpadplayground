class Square {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.originalSize = size;
    this.targetSize = size;
    this.hovered = false;
    // Initialize color properties
    this.color = null; // Initialized later
    this.targetColor = null; // Initialized later
    this.hoverColor = null; // Initialized later
    this.isTarget = false; // Add this line
  }

  update() {
    this.hovered = this.isMouseOver();
    this.targetSize = this.hovered ? this.originalSize + gapSize : this.originalSize;
    this.size = lerp(this.size, this.targetSize, 0.1);
    // Only update the target color if this square is not the current target
    if (!this.isTarget) {
      this.targetColor = this.hovered ? this.hoverColor : color(30);
    }
    // Lerp color towards the target color
    this.color = lerpColor(this.color, this.targetColor, 0.1);
  }

  isMouseOver() {
    return mouseX >= this.x - this.size / 2 && mouseX <= this.x + this.size / 2 &&
      mouseY >= this.y - this.size / 2 && mouseY <= this.y + this.size / 2;
  }

  draw() {
    fill(this.color); // Use the lerped color
    rect(this.x, this.y, this.size, this.size, 10);
  }

  makeTarget() {
    this.targetColor = targetColor; // Set target color to purple for lerping
    this.isTarget = true; // Set to true when this square becomes the target
  }

  // Add a new method to clear the target status
  clearTarget() {
    this.isTarget = false; // Set to false when this square is no longer the target
  }

  // Call this method after p5.js has been initialized
  initColors() {
    this.color = color(30); // Non-hover color
    this.targetColor = this.color; // Target color starts as the initial color
    this.hoverColor = color(100); // Hover color
  }
}

let squares = [];
const squareSize = 120;
const gapSize = 10;
const grid = 6;
let targetSquare = null; // This will hold the current target square
let targetColor; // Declare without initializing

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  targetColor = color(128, 0, 128); // Initialize here
  initializeGrid();
}

function initializeGrid() {
  const totalWidth = grid * (squareSize + gapSize) - gapSize;
  const totalHeight = grid * (squareSize + gapSize) - gapSize;
  const startX = (windowWidth - totalWidth) / 2 + squareSize / 2;
  const startY = (windowHeight - totalHeight) / 2 + squareSize / 2;

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const x = startX + i * (squareSize + gapSize);
      const y = startY + j * (squareSize + gapSize);
      let square = new Square(x, y, squareSize);
      square.initColors(); // Initialize colors for each square
      squares.push(square);
    }
  }
  // Select a random square as the initial target
  targetSquare = squares[Math.floor(Math.random() * squares.length)];
  targetSquare.makeTarget();
}

function draw() {
  background(0);
  squares.forEach(square => {
    square.update();
    square.draw();
  });
}

function mousePressed() {
  if (targetSquare && targetSquare.isMouseOver()) {
    targetSquare.clearTarget(); // Clear the previous target status

    // Select a new target square
    const randomIndex = floor(random(squares.length));
    targetSquare = squares[randomIndex];
    targetSquare.makeTarget(); // This now starts the color transition
  }
}