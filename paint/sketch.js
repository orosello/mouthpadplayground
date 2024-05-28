const BOTTOM_TEXT_Y_OFFSET = 50;
const FONT_SIZE = 16;

let randomCircleRadius = 0;
let myFont;
let showInstructions = true; // This should ensure instructions are shown initially
let isEraser = false; // Track if the eraser is selected

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

  // Toggle button for eraser and paintbrush
  toggleButton = createButton("Pick up eraser");
  toggleButton.position(windowWidth - 120, 10);
  toggleButton.mousePressed(toggleTool);

  // Styling the button
  toggleButton.style("font-family", "Press Start 2P");
  toggleButton.style("color", "white");
  toggleButton.style("background-color", "black");
  toggleButton.style("border", "2px solid white");
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
    randomCircleRadius = random(40, 80);

    fill(isEraser ? 0 : 255); // Use background color if eraser is selected
    strokeWeight(1);
    rectMode(CENTER);
    circle(mouseX, mouseY, randomCircleRadius);
  }

  // Display instructions if the flag is true
}

function toggleTool() {
  isEraser = !isEraser;
  toggleButton.html(isEraser ? "Pick up paintbrush" : "Pick up eraser");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
  toggleButton.position(windowWidth - 120, 10); // Ensure button stays in top right corner
}
