let myFont;

function preload() {
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);
}

function draw() {
  background(0);
  rotateX(angle);
  stroke(255);
  noFill();
  box(250); // Draw a 3D box with 100 pixels size

  // Set the text properties
  textFont(myFont);
  textSize(16);
  textAlign(CENTER);
  noStroke();
  fill(255);

  // Display the text
  text(
    "To scroll, gently slide your tongue \nfrom front to back",
    -windowWidth / 2 + 50, // Adjusted for WEBGL mode
    windowHeight / 2 - 80,
    windowWidth - 100 // subtracting 100 to leave some margin on both sides
  );
}

let angle = 0;

function mouseWheel(event) {
  if (event.delta > 0) {
    angle += 10; // Rotate right
  } else {
    angle -= 10; // Rotate left
  }
}
