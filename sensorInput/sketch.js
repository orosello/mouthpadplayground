let rects = [];
let rectSize = 45; // Adjusted to fit 12 columns
let gap = 5; // Adjusted to fit 8 rows
let activeQuadrant = 0;
let quadrantActivationCount = 0;
let forwardOrder = true;

let quadrantColors = [
  [255], // White color for quadrant 1
  [255],
  [255],
  [255],
];

function setup() {
  createCanvas(600, 400); // Adjust canvas size as needed
  noLoop();

  // Calculate the number of rectangles horizontally and vertically based on rectSize and gap
  let cols = width / (rectSize + gap);
  let rows = height / (rectSize + gap);

  // Generate rectangle positions
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // Check if the rectangle is fully within the canvas boundaries
      if (
        i * (rectSize + gap) + rectSize <= width &&
        j * (rectSize + gap) + rectSize <= height
      ) {
        rects.push({ x: i * (rectSize + gap), y: j * (rectSize + gap) });
      }
    }
  }
}

function draw() {
  background(0);

  let mouseQuadrant = getMouseQuadrant();

  for (let r of rects) {
    let d = dist(mouseX, mouseY, r.x + rectSize / 2, r.y + rectSize / 2);
    if (d < rectSize / 2) {
      fill(255); // White color
    } else {
      let rectQuadrant = getRectQuadrant(
        r.x + rectSize / 2,
        r.y + rectSize / 2
      );
      if (rectQuadrant === activeQuadrant) {
        fill(quadrantColors[rectQuadrant]);
      } else {
        fill(100); // Dark gray color
      }
    }
    noStroke();
    rect(r.x, r.y, rectSize, rectSize, 20); // The last parameter is for rounded corners
  }

  // If the mouse enters the active quadrant, select the next quadrant in order
  if (mouseQuadrant === activeQuadrant) {
    quadrantActivationCount++;
    if (quadrantActivationCount >= 8) {
      forwardOrder = !forwardOrder;
      quadrantActivationCount = 0;
    }
    activeQuadrant = forwardOrder
      ? (activeQuadrant + 1) % 4
      : (activeQuadrant + 3) % 4;
  }
}

function mouseMoved() {
  redraw();
}

function getMouseQuadrant() {
  if (mouseX < width / 2) {
    if (mouseY < height / 2) {
      return 0; // Top left quadrant
    } else {
      return 3; // Bottom left quadrant
    }
  } else {
    if (mouseY < height / 2) {
      return 1; // Top right quadrant
    } else {
      return 2; // Bottom right quadrant
    }
  }
}

function getRectQuadrant(x, y) {
  if (x < width / 2) {
    if (y < height / 2) {
      return 0; // Top left quadrant
    } else {
      return 3; // Bottom left quadrant
    }
  } else {
    if (y < height / 2) {
      return 1; // Top right quadrant
    } else {
      return 2; // Bottom right quadrant
    }
  }
}
