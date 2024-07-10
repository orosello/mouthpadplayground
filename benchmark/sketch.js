let gridSize = 30;
let cellSize = 24; // consistent cell size in pixels
let targetX, targetY;
let trialCount = 0;
let successfulClicks = 0;
let misclicks = 0;
let startTime = null; // Initialize as null
let bps = 0;
let ntpm = 0;
let netRate = 0; // variable for net rate
let missedClick = null; // store missed click coordinates
let hoveredX = -1,
  hoveredY = -1; // store hovered cell coordinates
let countdown = 60; // 60-second countdown timer
let timerEnded = false; // flag to indicate if the timer has ended
let clickTimestamps = []; // list to store timestamps of successful clicks
let gameStarted = false; // flag to indicate if the game has started

function disableRightClick() {
  window.addEventListener("contextmenu", preventDefault);
}

function disableScroll() {
  window.addEventListener("scroll", preventDefault, { passive: false });
  window.addEventListener("wheel", preventDefault, { passive: false });
  window.addEventListener("touchmove", preventDefault, { passive: false });
}

function preventDefault(e) {
  e.preventDefault();
}

function setup() {
  createCanvas(gridSize * cellSize, gridSize * cellSize);
  pickNewTarget();
  createMetrics();
  disableScroll(); // Call the function to disable scrolling
  disableRightClick(); // Call the function to disable right-clicks
}

function draw() {
  background(0);
  updateHover();
  drawGrid();
  drawTarget();
  if (missedClick) {
    drawMissedClick();
  }
  if (hoveredX !== -1 && hoveredY !== -1) {
    drawHoverHighlight();
  }
  if (startTime !== null && !timerEnded) {
    updateMetrics();
  }
}

function drawGrid() {
  stroke(128); // gray color
  strokeWeight(1); // default stroke weight
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      noFill();
      rect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }
}
function drawTarget() {
  fill("magenta");
  noStroke();
  rect(targetX * cellSize, targetY * cellSize, cellSize, cellSize);
}

function drawMissedClick() {
  fill("white");
  noStroke();
  rect(missedClick.x * cellSize, missedClick.y * cellSize, cellSize, cellSize);
}

function drawHoverHighlight() {
  stroke(255); // white color for hover
  strokeWeight(2); // thicker stroke for hovered cell
  noFill();
  rect(hoveredX * cellSize, hoveredY * cellSize, cellSize, cellSize);
}

function pickNewTarget() {
  targetX = floor(random(gridSize));
  targetY = floor(random(gridSize));
}

function mousePressed() {
  let clickedX = floor(mouseX / cellSize);
  let clickedY = floor(mouseY / cellSize);

  trialCount++; // Increment trial count on every click

  if (clickedX === targetX && clickedY === targetY) {
    successfulClicks++;
    clickTimestamps.push(millis()); // Record the timestamp of the successful click
    missedClick = null; // clear missed click on successful click
    pickNewTarget();

    if (!gameStarted) {
      startTime = millis(); // Initialize startTime when the first successful click occurs
      gameStarted = true; // Set the flag to indicate the game has started
    }
  } else {
    missedClick = { x: clickedX, y: clickedY };
    misclicks++;
  }

  netRate = successfulClicks - misclicks; // Update net rate after each click
}

function mouseReleased() {
  missedClick = null;
}

function updateHover() {
  hoveredX = floor(mouseX / cellSize);
  hoveredY = floor(mouseY / cellSize);

  if (
    hoveredX < 0 ||
    hoveredX >= gridSize ||
    hoveredY < 0 ||
    hoveredY >= gridSize
  ) {
    hoveredX = -1;
    hoveredY = -1;
  }
}

function createMetrics() {
  let metricsDiv = createDiv().id("metrics");
  metricsDiv.child(
    createDiv("Trial Count: 0").class("metric").id("trialCount")
  );
  metricsDiv.child(createDiv("Net Rate: 0").class("metric").id("netRate"));
  metricsDiv.child(
    createDiv(`Grid Size: ${gridSize}x${gridSize}`)
      .class("metric")
      .id("gridSize")
  );
  metricsDiv.child(
    createDiv("% Successful: 0%").class("metric").id("percentSuccessful")
  );
  metricsDiv.child(createDiv("NTPM: 0").class("metric").id("ntpm")); // Moved NTPM before BPS
  metricsDiv.child(createDiv("BPS: 0").class("metric").id("bps")); // Moved BPS after NTPM
  metricsDiv.child(createDiv("Last Click: 0s").class("metric").id("lastClick")); // Add last click metric
  metricsDiv.child(
    createDiv("Fastest Click: 0s").class("metric").id("fastestClick")
  ); // Add fastest click metric
  metricsDiv.child(
    createDiv("Average Click Time: 0s").class("metric").id("averageClickTime")
  ); // Add average click time metric
  metricsDiv.child(createDiv("Countdown: 60").class("metric").id("countdown")); // Add countdown timer
}

function updateMetrics() {
  if (!gameStarted || timerEnded) return; // Only update metrics if the game has started and the timer hasn't ended

  let elapsedTimeMinutes = (millis() - startTime) / 60000; // time in minutes

  if (elapsedTimeMinutes > 0) {
    ntpm = successfulClicks / elapsedTimeMinutes; // Calculate NTPM as successful clicks per minute
    let totalGridCells = gridSize * gridSize;
    let gridSizeLog2 = Math.log2(totalGridCells);
    bps = (ntpm * gridSizeLog2) / 60; // BPS calculation based on NTPM and grid size log2

    let totalClicks = successfulClicks + misclicks;
    let percentSuccessful =
      totalClicks > 0 ? (successfulClicks / totalClicks) * 100 : 0;

    select("#trialCount").html(`Trial Count: ${trialCount}`);
    select("#netRate").html(`Net Rate: ${netRate}`);
    select("#gridSize").html(`Grid Size: ${gridSize}x${gridSize}`);
    select("#percentSuccessful").html(
      `% Successful: ${percentSuccessful.toFixed(2)}%`
    );
    select("#ntpm").html(`NTPM: ${ntpm.toFixed(2)}`); // Update NTPM before BPS
    select("#bps").html(`BPS: ${bps.toFixed(2)}`); // Update BPS after NTPM

    // Update countdown timer
    let elapsedTimeSeconds = (millis() - startTime) / 1000;
    countdown = max(60 - floor(elapsedTimeSeconds), 0);
    select("#countdown").html(`Countdown: ${countdown}`);

    // Check if countdown has reached 0
    if (countdown === 0) {
      timerEnded = true; // Set the flag to indicate the timer has ended
    }

    // Calculate last click time
    if (clickTimestamps.length > 1) {
      let lastClickTime =
        (clickTimestamps[clickTimestamps.length - 1] -
          clickTimestamps[clickTimestamps.length - 2]) /
        1000;
      select("#lastClick").html(`Last Click: ${lastClickTime.toFixed(2)}s`);
    }

    // Calculate fastest click
    if (clickTimestamps.length > 1) {
      let clickIntervals = [];
      for (let i = 1; i < clickTimestamps.length; i++) {
        clickIntervals.push(
          (clickTimestamps[i] - clickTimestamps[i - 1]) / 1000
        );
      }
      let fastestClick = Math.min(...clickIntervals);
      select("#fastestClick").html(
        `Fastest Click: ${fastestClick.toFixed(2)}s`
      );
    }

    // Calculate average click time
    if (clickTimestamps.length > 1) {
      let totalTime =
        (clickTimestamps[clickTimestamps.length - 1] - clickTimestamps[0]) /
        1000;
      let averageClickTime = totalTime / (clickTimestamps.length - 1);
      select("#averageClickTime").html(
        `Average Click Time: ${averageClickTime.toFixed(2)}s`
      );
    }
  }
}
