// let r;
let cr = 10;
let rectangles = [];
let cols; let rows;
let size = 100;

function setup() {
  createCanvas(400, 400);
  cols = width / size;
  rows = height / size;
  for (let i = 0; i < cols; i++) {
    rectangles[i] = [];
    for (let j = 0; j < rows; j++) {
      rectangles[i][j] = new Rectangle(i * size, j * size, size, size);
    }
  }
  r = new Rectangle(100, 100, 100, 50);
}

function draw() {
  background(220);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      rectangles[i][j].drawRect();
      rectangles[i][j].collided(mouseX, mouseY, cr);
    }
  }

  fill(255, 0, 0);
  ellipse(mouseX, mouseY, cr * 2, cr * 2);
  r.collided(mouseX, mouseY, cr);
}
