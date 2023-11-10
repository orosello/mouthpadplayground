let circles = [];
let targetCircleIndex;
let clickedCircles = new Set(); // Set to keep track of clicked circles

function setup() {
  createCanvas(800, 600);
  const radius = 200; // radius of the circle on which the circles will be placed
  const circleCount = 5;
  const circleSize = 70;

  // Create circles
  for (let i = 0; i < circleCount; i++) {
    let angle = map(i, 0, circleCount, 0, TWO_PI); // map the index to an angle between 0 and 2*PI
    let x = width / 2 + radius * cos(angle); // calculate x coordinate
    let y = height / 2 + radius * sin(angle); // calculate y coordinate
    circles.push({
      x: x,
      y: y,
      r: circleSize,
      color: "gray",
    });
  }

  // Randomly select a target circle
  targetCircleIndex = floor(random(circles.length));
  circles[targetCircleIndex].color = "white";
}

function draw() {
  background(0);

  // Draw circles
  for (let circle of circles) {
    fill(circle.color);
    ellipse(circle.x, circle.y, circle.r * 2);
  }
}

function mousePressed() {
  let distanceToTarget = dist(
    mouseX,
    mouseY,
    circles[targetCircleIndex].x,
    circles[targetCircleIndex].y
  );

  // If the target circle is clicked
  if (distanceToTarget < circles[targetCircleIndex].r) {
    clickedCircles.add(targetCircleIndex); // Add the clicked circle to the set

    // Update circle sizes after all circles have been clicked
    if (clickedCircles.size === circles.length) {
      let newRadius;
      switch (circles[0].r) {
        case 70:
          newRadius = 50;
          break;
        case 50:
          newRadius = 20;
          break;
        case 20:
          newRadius = 40;
          break;
        case 40:
          newRadius = 8;
          break;
        case 8:
        default:
          newRadius = 70;
          break;
      }

      for (let circle of circles) {
        circle.r = newRadius;
      }
      clickedCircles.clear(); // Clear the set after updating circle sizes
    }

    // Reset all circles to gray
    for (let circle of circles) {
      circle.color = "gray";
    }

    // Select a new target circle
    let newTargetCircleIndex;
    do {
      newTargetCircleIndex = floor(random(circles.length));
    } while (clickedCircles.has(newTargetCircleIndex)); // Ensure the new target hasn't been clicked yet
    targetCircleIndex = newTargetCircleIndex;
    circles[targetCircleIndex].color = "white";
  }
}
