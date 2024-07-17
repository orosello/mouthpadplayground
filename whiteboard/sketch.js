let circleRadius = 5;
let myFont;
let prevMouseX, prevMouseY;
let painting = true;

function preload() {
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Prevent the context menu from opening on right click
  canvas.oncontextmenu = (e) => e.preventDefault();

  textFont(myFont);
  textSize(16);
  textAlign(CENTER);

  // Initialize previous mouse positions
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

function draw() {
  if (painting) {
    stroke(255);
    strokeWeight(circleRadius * 2);
    line(prevMouseX, prevMouseY, mouseX, mouseY);
  }

  // Update previous mouse positions
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

function mousePressed() {
  painting = false;
  prevMouseX = mouseX;
  prevMouseY = mouseY;
}

function mouseReleased() {
  painting = true;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
