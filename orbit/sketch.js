let myFont;

function preload() {
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
  background(0);

  // Orbit control enables easy 3D rotation of canvas with mouse
  // Only when mouse is pressed
  if (mouseIsPressed) {
    orbitControl();
  }

  // Set the fill color to white
  fill(255);
  // Set the stroke color to black
  stroke(0);

  // Rotate the cylinder 90 degrees around the X-axis
  rotateX(HALF_PI);

  // Calculate the radius and height of the cylinder based on the window size
  let radius = windowWidth * 0.03; // 5% of window width
  let height = windowHeight * 0.95; // 80% of window height

  // Draw a cylinder with calculated radius and height, and increased resolution
  cylinder(radius, height, 64, 64);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

let s = function (p) {
  let myFont;

  p.preload = function () {
    myFont = p.loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
  };

  p.setup = function () {
    let canvas = p.createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.style("z-index", "1"); // Make sure the canvas is on top
  };

  p.draw = function () {
    p.background(0, 0, 0, 0); // Transparent background

    // Set the text properties
    p.textFont(myFont);
    p.textSize(16);
    p.textAlign(p.CENTER);
    p.noStroke();
    p.fill(255);

    // Display the text
    p.text(
      "To click and drag, hold your\n tongue against the roof of \n your mouth. Next, move the \n cursor. Then, tap to release.",
      windowWidth / 2 - (windowWidth - 100) / 2,
      windowHeight - 100,
      windowWidth - 100 // subtracting 100 to leave some margin on both sides
    );
  };
};

let myp5 = new p5(s);
