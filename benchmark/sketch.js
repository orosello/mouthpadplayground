let gridSize = 30;
let cellSize = 24; // consistent cell size in pixels
let targetX, targetY;
let trialCount = 0;
let successfulClicks = 0;
let misclicks = 0;
let startTime = null;
let bps = 0;
let ntpm = 0;
let netRate = 0;
let missedClick = null;
let hoveredX = -1,
  hoveredY = -1;
let countdown = 60; // 60-second countdown timer
let timerEnded = false;
let clickTimestamps = [];
let gameStarted = false;
let sendMetricsButton;

function setup() {
  createCanvas(gridSize * cellSize, gridSize * cellSize);
  pickNewTarget();
  createMetrics();
  disableScroll();
  disableRightClick();
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
  stroke(128);
  strokeWeight(1);
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
  stroke(255);
  strokeWeight(2);
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

  if (clickedX === targetX && clickedY === targetY) {
    if (!gameStarted) {
      // Reset metrics and start the game
      startTime = millis();
      gameStarted = true;
      trialCount = 0;
      successfulClicks = 0;
      misclicks = 0;
      netRate = 0;
      clickTimestamps = [];
    }

    trialCount++;
    successfulClicks++;
    clickTimestamps.push(millis());
    missedClick = null;
    pickNewTarget();
  } else if (gameStarted) {
    // Only count misclicks after the game has started
    trialCount++;
    misclicks++;
    missedClick = { x: clickedX, y: clickedY };
  }

  if (gameStarted) {
    netRate = successfulClicks - misclicks;
  }
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
  metricsDiv.child(createDiv("NTPM: 0").class("metric").id("ntpm"));
  metricsDiv.child(createDiv("BPS: 0").class("metric").id("bps"));
  metricsDiv.child(createDiv("Last Click: 0s").class("metric").id("lastClick"));
  metricsDiv.child(
    createDiv("Fastest Click: 0s").class("metric").id("fastestClick")
  );
  metricsDiv.child(
    createDiv("Average Click Time: 0s").class("metric").id("averageClickTime")
  );
  metricsDiv.child(createDiv("Countdown: 60").class("metric").id("countdown"));
}

function updateMetrics() {
  if (!gameStarted || timerEnded) return;

  let elapsedTimeMinutes = (millis() - startTime) / 60000;

  if (elapsedTimeMinutes > 0) {
    ntpm = successfulClicks / elapsedTimeMinutes;
    let totalGridCells = gridSize * gridSize;
    let gridSizeLog2 = Math.log2(totalGridCells);
    bps = (ntpm * gridSizeLog2) / 60;

    let totalClicks = successfulClicks + misclicks;
    let percentSuccessful =
      totalClicks > 0 ? (successfulClicks / totalClicks) * 100 : 0;

    select("#trialCount").html(`Trial Count: ${trialCount}`);
    select("#netRate").html(`Net Rate: ${netRate}`);
    select("#gridSize").html(`Grid Size: ${gridSize}x${gridSize}`);
    select("#percentSuccessful").html(
      `% Successful: ${percentSuccessful.toFixed(2)}%`
    );
    select("#ntpm").html(`NTPM: ${ntpm.toFixed(2)}`);
    select("#bps").html(`BPS: ${bps.toFixed(2)}`);

    let elapsedTimeSeconds = (millis() - startTime) / 1000;
    countdown = max(60 - floor(elapsedTimeSeconds), 0);
    select("#countdown").html(`Countdown: ${countdown}`);

    if (countdown === 0 && !timerEnded) {
      timerEnded = true;
      createSendMetricsButton();
    }

    if (clickTimestamps.length > 1) {
      let lastClickTime =
        (clickTimestamps[clickTimestamps.length - 1] -
          clickTimestamps[clickTimestamps.length - 2]) /
        1000;
      select("#lastClick").html(`Last Click: ${lastClickTime.toFixed(2)}s`);

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

function createSendMetricsButton() {
  sendMetricsButton = createButton("Send Metrics");
  sendMetricsButton.position(width / 2 - 50, height - 50);
  sendMetricsButton.mousePressed(saveMetricsAndRedirect);
}

function saveMetricsAndRedirect() {
  let metrics = {
    trialCount,
    netRate,
    gridSize,
    percentSuccessful: ((successfulClicks / trialCount) * 100).toFixed(2),
    ntpm: ntpm.toFixed(2),
    bps: bps.toFixed(2),
    lastClick: select("#lastClick").html().split(": ")[1],
    fastestClick: select("#fastestClick").html().split(": ")[1],
    averageClickTime: select("#averageClickTime").html().split(": ")[1],
  };

  localStorage.setItem("benchmarkMetrics", JSON.stringify(metrics));
  window.location.href = "../type/type.html";
}

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
