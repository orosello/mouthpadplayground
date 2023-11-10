let circles = [];
let targetCircleIndex;
let clickedCircles = new Set(); // Set to keep track of clicked circles
let totalClicks = 0; // Total number of clicks throughout the game

function setup() {
  createCanvas(800, 600);
  initializeCircles();
  selectTargetCircle();
}

function draw() {
  background(0);
  drawCircles();
  drawProgressBar();
}

function mousePressed() {
  handleMousePress();
}

// Function to initialize circles
function initializeCircles() {
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
}

// Function to select a target circle
function selectTargetCircle() {
  // Randomly select a target circle
  targetCircleIndex = floor(random(circles.length));
  circles[targetCircleIndex].color = "white";
}

// Function to draw circles
function drawCircles() {
  // Draw circles
  for (let circle of circles) {
    noStroke(); // Ensure circles don't have an outline
    fill(circle.color);
    ellipse(circle.x, circle.y, circle.r * 2);
  }
}

// Function to handle mouse press
function handleMousePress() {
  let distanceToTarget = dist(
    mouseX,
    mouseY,
    circles[targetCircleIndex].x,
    circles[targetCircleIndex].y
  );

  // If the target circle is clicked
  if (distanceToTarget < circles[targetCircleIndex].r) {
    handleCircleClick();
  }
}

// Function to handle circle click
function handleCircleClick() {
  clickedCircles.add(targetCircleIndex); // Add the clicked circle to the set
  totalClicks++; // Increment total clicks

  // Update circle sizes after all circles have been clicked
  if (clickedCircles.size === circles.length) {
    updateCircleSizes();
    clickedCircles.clear(); // Clear the set after updating circle sizes
  }

  // Reset all circles to gray
  for (let circle of circles) {
    circle.color = "gray";
  }

  // Select a new target circle
  selectNewTargetCircle();
}

// Function to update circle sizes
function updateCircleSizes() {
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
}

// Function to select a new target circle
function selectNewTargetCircle() {
  let newTargetCircleIndex;
  do {
    newTargetCircleIndex = floor(random(circles.length));
  } while (clickedCircles.has(newTargetCircleIndex)); // Ensure the new target hasn't been clicked yet
  targetCircleIndex = newTargetCircleIndex;
  circles[targetCircleIndex].color = "white";
}

// Function to draw progress bar
function drawProgressBar() {
  let progress = totalClicks / (circles.length * 5); // Calculate progress based on total clicks
  let progressBarWidth = (width - 100) * progress; // Calculate width of the progress bar

  strokeWeight(5); // Set line thickness
  stroke(100); // Set line color to white
  line(50, height - 5, 50 + progressBarWidth, height - 5); // Draw line
  noStroke(); // Reset stroke settings
}
