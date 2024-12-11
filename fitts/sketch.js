let circles = [];
let targetCircleIndex;
let clickedCircles = new Set(); // Set to keep track of clicked circles
let totalClicks = 0; // Total number of clicks throughout the game
let baseCircleColor = 30;
let canvas; // Define a variable to hold the canvas object
let showText = true; // Variable to control the visibility of the text
let myFont; // Variable to hold the font

function preload() {
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf");
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight); // Store the canvas object
  initializeCircles();
  selectTargetCircle();

  // Prevent the context menu from appearing on right click for the entire document
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  // Disable text selection on the canvas
  canvas.elt.style.userSelect = "none";

  // ... rest of the setup code ...
}

function draw() {
  background(0);
  drawCircles();
  drawProgressBar();

  if (showText) {
    noStroke();
    fill(255);
    textFont(myFont);
    textSize(16);
    textAlign(CENTER);
    text(
      "Click on the white circle",
      windowWidth / 2 - (windowWidth - 100) / 2,
      windowHeight - 100,
      windowWidth - 100 // subtracting 100 to leave some margin on both sides
    );
  }
}

function mousePressed() {
  handleMousePress();
}

// Function to initialize circles
function initializeCircles() {
  const maxRadius = min(windowWidth, windowHeight) / 3; // Calculate max radius based on window size
  const circleCount = 5;
  const maxCircleSize = maxRadius / 3; // Calculate max circle size based on max radius

  // Create circles
  for (let i = 0; i < circleCount; i++) {
    let angle = map(i, 0, circleCount, 0, TWO_PI); // map the index to an angle between 0 and 2*PI
    let x = windowWidth / 2 + maxRadius * cos(angle); // calculate x coordinate
    let y = windowHeight / 2 + maxRadius * sin(angle) - 20; // calculate y coordinate
    circles.push({
      x: x,
      y: y,
      r: maxCircleSize,
      color: baseCircleColor,
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
  for (let i = 0; i < circles.length; i++) {
    let circle = circles[i];
    let isHovered = dist(mouseX, mouseY, circle.x, circle.y) < circle.r;

    if (circle.color === baseCircleColor) {
      fill("black");
      stroke("white");
      strokeWeight(1);
    } else {
      noStroke();
      fill(circle.color);
    }

    if (i === targetCircleIndex && isHovered) {
      stroke("white");
      strokeWeight(10);
    }

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

  if (showText) {
    showText = false;
  }

  // Update circle sizes after all circles have been clicked
  if (clickedCircles.size === circles.length) {
    updateCircleSizes();
    clickedCircles.clear(); // Clear the set after updating circle sizes
  }

  // Reset all circles to gray
  for (let circle of circles) {
    circle.color = baseCircleColor;
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
      newRadius = 7; //aprox close window size icon, Corbin's suggestion
      break;
    case 7:
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
  let progressBarWidth = (windowWidth - 100) * progress; // Calculate width of the progress bar

  strokeWeight(5); // Set line thickness
  stroke(100); // Set line color to white
  line(50, windowHeight - 20, 50 + progressBarWidth, windowHeight - 20); // Draw line
  noStroke(); // Reset stroke settings
}
