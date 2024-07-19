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

// Variables for Fitts' law calculations
let lastClickX = -1,
  lastClickY = -1;
let totalIndexOfDifficulty = 0;
let totalAcquireTime = 0;
let fittsBps = 0;

// Variables for additional timing metrics
let nearTargetTime = 0;
let inTargetTime = 0;
let clickGenerationTime = 0;
let lastNearTargetTime = 0;
let lastInTargetTime = 0;
let isNearTarget = false;
let isInTarget = false;

function setup() {
  createCanvas(gridSize * cellSize, gridSize * cellSize);
  pickNewTarget();
  createMetrics();
  disableScroll();
  disableRightClick();
  updateInitialMetricDisplay();
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
    updateTimingMetrics();
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

function updateTimingMetrics() {
  if (!gameStarted) return;

  let currentTime = millis();
  let distanceToTarget = dist(hoveredX, hoveredY, targetX, targetY);

  if (distanceToTarget <= sqrt(2) && !isNearTarget) {
    isNearTarget = true;
    lastNearTargetTime = currentTime;
  } else if (distanceToTarget > sqrt(2)) {
    if (isNearTarget) {
      nearTargetTime += currentTime - lastNearTargetTime;
    }
    isNearTarget = false;
    lastNearTargetTime = 0;
  }

  if (hoveredX === targetX && hoveredY === targetY) {
    if (!isInTarget) {
      isInTarget = true;
      lastInTargetTime = currentTime;
    }
  } else {
    if (isInTarget) {
      inTargetTime += currentTime - lastInTargetTime;
    }
    isInTarget = false;
    lastInTargetTime = 0;
  }
}

function mousePressed() {
  let clickedX = floor(mouseX / cellSize);
  let clickedY = floor(mouseY / cellSize);

  if (clickedX === targetX && clickedY === targetY) {
    let currentTime = millis();
    if (!gameStarted) {
      startTime = currentTime;
      gameStarted = true;
      resetMetrics();
      lastClickX = clickedX;
      lastClickY = clickedY;
      trialCount = 1;
      successfulClicks = 1;
      updateMetricDisplay("trialCount", trialCount);
    } else {
      trialCount++;
      successfulClicks++;
      clickTimestamps.push(currentTime);

      if (isInTarget && lastInTargetTime !== 0) {
        clickGenerationTime += currentTime - lastInTargetTime;
      }

      if (lastClickX !== -1 && lastClickY !== -1) {
        let distance =
          dist(lastClickX, lastClickY, clickedX, clickedY) * cellSize;
        let width = cellSize; // The width of the target
        let indexOfDifficulty = Math.log2((distance + width) / width);
        let acquireTime =
          (currentTime - clickTimestamps[clickTimestamps.length - 2]) / 1000; // in seconds

        if (acquireTime > 0) {
          // Prevent division by zero
          totalIndexOfDifficulty += indexOfDifficulty;
          totalAcquireTime += acquireTime;

          // Calculate and log Fitts' law metrics for this click
          let clickFittsBps = indexOfDifficulty / acquireTime;
          console.log(
            `Click ${successfulClicks}: Distance = ${distance.toFixed(
              2
            )}, ID = ${indexOfDifficulty.toFixed(
              2
            )}, Time = ${acquireTime.toFixed(
              2
            )}s, Fitts' BPS = ${clickFittsBps.toFixed(2)} bits/s`
          );
        }
      }

      lastClickX = clickedX;
      lastClickY = clickedY;
    }

    missedClick = null;
    pickNewTarget();
    resetTimingStates();
  } else if (gameStarted) {
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

function resetMetrics() {
  trialCount = 0;
  successfulClicks = 0;
  misclicks = 0;
  netRate = 0;
  clickTimestamps = [];
  totalIndexOfDifficulty = 0;
  totalAcquireTime = 0;
  nearTargetTime = 0;
  inTargetTime = 0;
  clickGenerationTime = 0;
  resetTimingStates();
}

function resetTimingStates() {
  isNearTarget = false;
  isInTarget = false;
  lastNearTargetTime = 0;
  lastInTargetTime = 0;
}

function pickNewTarget() {
  do {
    targetX = floor(random(gridSize));
    targetY = floor(random(gridSize));
  } while (targetX === lastClickX && targetY === lastClickY);
}

function updateMetrics() {
  let elapsedTimeMinutes = (millis() - startTime) / 60000;
  let elapsedTimeSeconds = elapsedTimeMinutes * 60;

  if (elapsedTimeSeconds > 0) {
    ntpm = successfulClicks / elapsedTimeMinutes;
    let totalGridCells = gridSize * gridSize;
    let gridSizeLog2 = Math.log2(totalGridCells);
    bps = (ntpm * gridSizeLog2) / 60;

    // Calculate overall Fitts' law BPS
    if (totalAcquireTime > 0) {
      // Prevent division by zero
      fittsBps = totalIndexOfDifficulty / totalAcquireTime;
    }

    let totalClicks = successfulClicks + misclicks;
    let percentSuccessful =
      totalClicks > 0 ? (successfulClicks / totalClicks) * 100 : 0;

    updateMetricDisplay("trialCount", trialCount);
    updateMetricDisplay("netRate", netRate);
    updateMetricDisplay(
      "percentSuccessful",
      percentSuccessful.toFixed(2) + "%"
    );
    updateMetricDisplay("ntpm", ntpm.toFixed(2));
    updateMetricDisplay("bps", bps.toFixed(2));
    updateMetricDisplay("fittsBps", fittsBps.toFixed(2));
    updateMetricDisplay(
      "nearTargetTime",
      (nearTargetTime / 1000).toFixed(2) + "s"
    );
    updateMetricDisplay("inTargetTime", (inTargetTime / 1000).toFixed(2) + "s");
    updateMetricDisplay(
      "clickGenerationTime",
      (clickGenerationTime / 1000).toFixed(2) + "s"
    );

    if (clickTimestamps.length > 1) {
      let lastClickTime =
        (clickTimestamps[clickTimestamps.length - 1] -
          clickTimestamps[clickTimestamps.length - 2]) /
        1000;
      updateMetricDisplay("lastClick", lastClickTime.toFixed(2) + "s");

      let clickIntervals = [];
      for (let i = 1; i < clickTimestamps.length; i++) {
        clickIntervals.push(
          (clickTimestamps[i] - clickTimestamps[i - 1]) / 1000
        );
      }
      let fastestClick = Math.min(...clickIntervals);
      updateMetricDisplay("fastestClick", fastestClick.toFixed(2) + "s");

      let totalTime =
        (clickTimestamps[clickTimestamps.length - 1] - clickTimestamps[0]) /
        1000;
      let averageClickTime = totalTime / (clickTimestamps.length - 1);
      updateMetricDisplay(
        "averageClickTime",
        averageClickTime.toFixed(2) + "s"
      );
    }

    countdown = max(60 - floor(elapsedTimeSeconds), 0);
    updateMetricDisplay("countdown", countdown);

    if (countdown === 0 && !timerEnded) {
      timerEnded = true;
      createSendMetricsButton();
    }

    // Log overall Fitts' law metrics
    console.log(
      `Overall: Total ID = ${totalIndexOfDifficulty.toFixed(
        2
      )}, Total Time = ${totalAcquireTime.toFixed(
        2
      )}s, Fitts' BPS = ${fittsBps.toFixed(2)} bits/s`
    );
  }
}

function updateMetricDisplay(id, value) {
  select(`#${id}`).html(
    `${
      id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, " $1")
    }: ${value}`
  );
}

function createMetrics() {
  let metricsDiv = createDiv().id("metrics");
  let metricIds = [
    "trialCount",
    "netRate",
    "gridSize",
    "percentSuccessful",
    "ntpm",
    "bps",
    "fittsBps",
    "nearTargetTime",
    "inTargetTime",
    "clickGenerationTime",
    "lastClick",
    "fastestClick",
    "averageClickTime",
    "countdown",
  ];

  metricIds.forEach((id) => {
    metricsDiv.child(
      createDiv(
        `${
          id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, " $1")
        }: 0`
      )
        .class("metric")
        .id(id)
    );
  });
}

function updateInitialMetricDisplay() {
  updateMetricDisplay("countdown", countdown);
  updateMetricDisplay("gridSize", `${gridSize}x${gridSize}`);
  updateMetricDisplay("trialCount", 0);
  updateMetricDisplay("netRate", 0);
  updateMetricDisplay("percentSuccessful", "0.00%");
  updateMetricDisplay("ntpm", "0.00");
  updateMetricDisplay("bps", "0.00");
  updateMetricDisplay("fittsBps", "0.00");
  updateMetricDisplay("nearTargetTime", "0.00s");
  updateMetricDisplay("inTargetTime", "0.00s");
  updateMetricDisplay("clickGenerationTime", "0.00s");
  updateMetricDisplay("lastClick", "0.00s");
  updateMetricDisplay("fastestClick", "0.00s");
  updateMetricDisplay("averageClickTime", "0.00s");
}

function createSendMetricsButton() {
  sendMetricsButton = createButton("Send Results");
  sendMetricsButton.position(20, windowHeight / 2);
  sendMetricsButton.class("send-metrics-button");
  sendMetricsButton.mousePressed(saveMetricsAndRedirect);
}

function saveMetricsAndRedirect() {
  let metrics = {
    trialCount,
    netRate,
    gridSize: `${gridSize}x${gridSize}`,
    percentSuccessful: ((successfulClicks / trialCount) * 100).toFixed(2),
    ntpm: ntpm.toFixed(2),
    bps: bps.toFixed(2),
    fittsBps: fittsBps.toFixed(2),
    nearTargetTime: (nearTargetTime / 1000).toFixed(2),
    inTargetTime: (inTargetTime / 1000).toFixed(2),
    clickGenerationTime: (clickGenerationTime / 1000).toFixed(2),
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
