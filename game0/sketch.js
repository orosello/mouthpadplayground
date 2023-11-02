let rects = [];
let rectSize = 50; // You can adjust this as needed
let gap = 5; // Gap between rectangles, adjust as needed

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
          if ((i * (rectSize + gap) + rectSize <= width) && (j * (rectSize + gap) + rectSize <= height)) {
              rects.push({ x: i * (rectSize + gap), y: j * (rectSize + gap) });
          }
      }
  }
}


function draw() {
    background(0);

    for (let r of rects) {
        let d = dist(mouseX, mouseY, r.x + rectSize / 2, r.y + rectSize / 2);
        if (d < rectSize / 2) {
          noStroke();
            fill(255);
        } else {
          noStroke();
            fill(100); // Dark gray color
        }
        rect(r.x, r.y, rectSize, rectSize, 20); // The last parameter is for rounded corners
    }

    // Draw the central square and lines
    fill(50); // Even darker gray for the central square
    rect(width / 2 - rectSize, height / 2 - rectSize, 2 * rectSize, 2 * rectSize);

    stroke(255);
    line(width / 2, height / 2, width, height / 2);
    line(width / 2, height / 2, 0, height / 2);
    line(width / 2, height / 2, width / 2, 0);
    line(width / 2, height / 2, width / 2, height);
}

function mouseMoved() {
    redraw();
}
