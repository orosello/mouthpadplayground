let circles = [];
let redCircleIndex;

function setup() {
  createCanvas(800, 600);
  let radius = 200; // radius of the circle on which the circles will be placed
  for (let i = 0; i < 5; i++) {
    let angle = map(i, 0, 5, 0, TWO_PI); // map the index to an angle between 0 and 2*PI
    let x = width / 2 + radius * cos(angle); // calculate x coordinate
    let y = height / 2 + radius * sin(angle); // calculate y coordinate
    circles.push({
      x: x,
      y: y,
      r: 50,
      color: 'gray' // add color property
    });
  }
  redCircleIndex = floor(random(circles.length));
  circles[redCircleIndex].color = 'red'; // set the color of the red circle
}

function draw() {
  background(220);
  for (let i = 0; i < circles.length; i++) {
    fill(circles[i].color); // use the color property to set the color
    ellipse(circles[i].x, circles[i].y, circles[i].r * 2);
  }
}

function mousePressed() {
  let d = dist(mouseX, mouseY, circles[redCircleIndex].x, circles[redCircleIndex].y);
  if (d < circles[redCircleIndex].r) {
    // Fill all the circles gray
    for (let i = 0; i < circles.length; i++) {
      circles[i].color = 'gray'; // update the color property
    }
    // Fill another circle red at random
    redCircleIndex = floor(random(circles.length));
    circles[redCircleIndex].color = 'red'; // update the color property
  }
}