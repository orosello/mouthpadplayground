let circles = [];
let whiteCircleIndex;
let clickCount = 0;

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
      r: 70,
      color: 'gray' // add color property
    });
  }
  whiteCircleIndex = floor(random(circles.length));
  circles[whiteCircleIndex].color = 'white'; // set the color of the white circle
}

function draw() {
  background(0);
  for (let i = 0; i < circles.length; i++) {
    fill(circles[i].color); // use the color property to set the color
    ellipse(circles[i].x, circles[i].y, circles[i].r * 2);
  }
}

function mousePressed() {
  let d = dist(mouseX, mouseY, circles[whiteCircleIndex].x, circles[whiteCircleIndex].y);
  if (d < circles[whiteCircleIndex].r) {
    clickCount++;
    if (clickCount === 4) {
      for (let i = 0; i < circles.length; i++) {
        circles[i].r = 50;
      }
    } else if (clickCount === 8) {
      for (let i = 0; i < circles.length; i++) {
        circles[i].r = 20;
      }
    } else if (clickCount === 12) {
      for (let i = 0; i < circles.length; i++) {
        circles[i].r = 40;
      }
      clickCount = 0; // reset the count after reaching 12
    }

    // Fill all the circles gray
    for (let i = 0; i < circles.length; i++) {
      circles[i].color = 'gray'; // update the color property
    }
    // Fill another circle white at random
    let newWhiteCircleIndex;
    do {
      newWhiteCircleIndex = floor(random(circles.length));
    } while (newWhiteCircleIndex === whiteCircleIndex);
    whiteCircleIndex = newWhiteCircleIndex;
    circles[whiteCircleIndex].color = 'white'; // update the color property
  }
}