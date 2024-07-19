// Game Configuration
const CONFIG = {
  gridSize: 30,
  cellSize: 24, // pixels
  gameDuration: 60, // seconds
  nearTargetSize: 1,
};

// Game State
let gameState = {
  targetX: 0,
  targetY: 0,
  trialCount: 0,
  successfulClicks: 0,
  misclicks: 0,
  startTime: null,
  hoveredX: -1,
  hoveredY: -1,
  missedClick: null,
  lastClickX: -1,
  lastClickY: -1,
  clickTimestamps: [],
  gameStarted: false,
  timerEnded: false,
};

// Metrics
let metrics = {
  bps: 0,
  ntpm: 0,
  netRate: 0,
  totalIndexOfDifficulty: 0,
  totalAcquireTime: 0,
  fittsBps: 0,
  nearTargetTime: 0,
  inTargetTime: 0,
  clickGenerationTime: 0,
  lastNearTargetTime: 0,
  lastInTargetTime: 0,
  isNearTarget: false,
  isInTarget: false,
  clickGenerationStartTime: 0,
  currentClickGenerationTime: 0,
};

const METRIC_IDS = [
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

function setup() {
  createCanvas(
    CONFIG.gridSize * CONFIG.cellSize,
    CONFIG.gridSize * CONFIG.cellSize
  );
  pickNewTarget();
  createMetricsDisplay();
  disableDefaultBehaviors();
  updateInitialMetricDisplay();
}

function draw() {
  background(0);
  updateHover();
  drawGrid();
  drawTarget();
  drawMissedClick();
  drawHoverHighlight();
  updateTimingMetrics();
  if (gameState.gameStarted && !gameState.timerEnded) {
    updateMetrics();
  }
}

function mousePressed() {
  const clickedX = floor(mouseX / CONFIG.cellSize);
  const clickedY = floor(mouseY / CONFIG.cellSize);

  if (clickedX === gameState.targetX && clickedY === gameState.targetY) {
    handleSuccessfulClick(clickedX, clickedY);
  } else if (gameState.gameStarted) {
    handleMissedClick(clickedX, clickedY);
  }

  if (gameState.gameStarted) {
    metrics.netRate = gameState.successfulClicks - gameState.misclicks;
  }
}

function mouseReleased() {
  gameState.missedClick = null;
}

function handleSuccessfulClick(clickedX, clickedY) {
  const currentTime = millis();
  if (!gameState.gameStarted) {
    startGame(currentTime);
  } else {
    recordSuccessfulClick(currentTime, clickedX, clickedY);
  }

  // Add the current click generation time to the total
  metrics.clickGenerationTime += metrics.currentClickGenerationTime;

  gameState.missedClick = null;
  pickNewTarget();
  resetTimingStates();
}

function startGame(currentTime) {
  gameState.startTime = currentTime;
  gameState.gameStarted = true;
  resetMetrics();
  gameState.lastClickX = gameState.targetX;
  gameState.lastClickY = gameState.targetY;
  gameState.trialCount = 1;
  gameState.successfulClicks = 1;
  updateMetricDisplay("trialCount", gameState.trialCount);
}

function recordSuccessfulClick(currentTime, clickedX, clickedY) {
  gameState.trialCount++;
  gameState.successfulClicks++;
  gameState.clickTimestamps.push(currentTime);

  if (gameState.lastClickX !== -1 && gameState.lastClickY !== -1) {
    calculateFittsLawMetrics(currentTime, clickedX, clickedY);
  }

  gameState.lastClickX = clickedX;
  gameState.lastClickY = clickedY;
}

function calculateFittsLawMetrics(currentTime, clickedX, clickedY) {
  const distance =
    dist(gameState.lastClickX, gameState.lastClickY, clickedX, clickedY) *
    CONFIG.cellSize;
  const width = CONFIG.cellSize;
  const indexOfDifficulty = Math.log2((distance + width) / width);
  const acquireTime =
    (currentTime -
      gameState.clickTimestamps[gameState.clickTimestamps.length - 2]) /
    1000;

  if (acquireTime > 0) {
    metrics.totalIndexOfDifficulty += indexOfDifficulty;
    metrics.totalAcquireTime += acquireTime;

    const clickFittsBps = indexOfDifficulty / acquireTime;
    console.log(
      `Click ${gameState.successfulClicks}: Distance = ${distance.toFixed(
        2
      )}, ID = ${indexOfDifficulty.toFixed(2)}, Time = ${acquireTime.toFixed(
        2
      )}s, Fitts' BPS = ${clickFittsBps.toFixed(2)} bits/s`
    );
  }
}

function handleMissedClick(clickedX, clickedY) {
  gameState.trialCount++;
  gameState.misclicks++;
  gameState.missedClick = { x: clickedX, y: clickedY };
}

function updateHover() {
  gameState.hoveredX = floor(mouseX / CONFIG.cellSize);
  gameState.hoveredY = floor(mouseY / CONFIG.cellSize);

  if (
    gameState.hoveredX < 0 ||
    gameState.hoveredX >= CONFIG.gridSize ||
    gameState.hoveredY < 0 ||
    gameState.hoveredY >= CONFIG.gridSize
  ) {
    gameState.hoveredX = -1;
    gameState.hoveredY = -1;
  }
}

function checkIfNearTarget(x, y, targetX, targetY) {
  for (let dx = -CONFIG.nearTargetSize; dx <= CONFIG.nearTargetSize; dx++) {
    for (let dy = -CONFIG.nearTargetSize; dy <= CONFIG.nearTargetSize; dy++) {
      if (dx === 0 && dy === 0) continue; // Skip the target itself
      let adjacentX = targetX + dx;
      let adjacentY = targetY + dy;
      if (x === adjacentX && y === adjacentY) {
        return true;
      }
    }
  }
  return false;
}

function updateTimingMetrics() {
  if (!gameState.gameStarted || gameState.timerEnded) return;

  const currentTime = millis();
  updateNearTargetMetrics(currentTime);
  updateInTargetMetrics(currentTime);
  updateMetricDisplay(
    "clickGenerationTime",
    (metrics.currentClickGenerationTime / 1000).toFixed(2) + "s"
  );
}

function updateNearTargetMetrics(currentTime) {
  if (
    checkIfNearTarget(
      gameState.hoveredX,
      gameState.hoveredY,
      gameState.targetX,
      gameState.targetY
    )
  ) {
    if (!metrics.isNearTarget) {
      metrics.isNearTarget = true;
      metrics.lastNearTargetTime = currentTime;
    }
    metrics.nearTargetTime += currentTime - metrics.lastNearTargetTime;
    metrics.lastNearTargetTime = currentTime;
  } else {
    metrics.isNearTarget = false;
    metrics.lastNearTargetTime = 0;
  }
}

function updateInTargetMetrics(currentTime) {
  if (
    gameState.hoveredX === gameState.targetX &&
    gameState.hoveredY === gameState.targetY
  ) {
    if (!metrics.isInTarget) {
      metrics.isInTarget = true;
      metrics.lastInTargetTime = currentTime;
      metrics.clickGenerationStartTime = currentTime;
    }
    metrics.inTargetTime += currentTime - metrics.lastInTargetTime;
    metrics.lastInTargetTime = currentTime;
    metrics.currentClickGenerationTime =
      currentTime - metrics.clickGenerationStartTime;
  } else {
    if (metrics.isInTarget) {
      metrics.clickGenerationStartTime = 0;
      metrics.currentClickGenerationTime = 0;
    }
    metrics.isInTarget = false;
    metrics.lastInTargetTime = 0;
  }
}

function updateMetrics() {
  const elapsedTimeMinutes = (millis() - gameState.startTime) / 60000;
  const elapsedTimeSeconds = elapsedTimeMinutes * 60;

  if (elapsedTimeSeconds > 0) {
    calculateAndUpdateMetrics(elapsedTimeMinutes, elapsedTimeSeconds);
    updateCountdown(elapsedTimeSeconds);
    logOverallFittsLawMetrics();
  }
}

function calculateAndUpdateMetrics(elapsedTimeMinutes, elapsedTimeSeconds) {
  metrics.ntpm = gameState.successfulClicks / elapsedTimeMinutes;
  const totalGridCells = CONFIG.gridSize * CONFIG.gridSize;
  const gridSizeLog2 = Math.log2(totalGridCells);
  metrics.bps = (metrics.ntpm * gridSizeLog2) / 60;

  if (metrics.totalAcquireTime > 0) {
    metrics.fittsBps =
      metrics.totalIndexOfDifficulty / metrics.totalAcquireTime;
  }

  const totalClicks = gameState.successfulClicks + gameState.misclicks;
  const percentSuccessful =
    totalClicks > 0 ? (gameState.successfulClicks / totalClicks) * 100 : 0;

  updateMetricDisplays(percentSuccessful);
  updateClickTimeMetrics();
}

function updateMetricDisplays(percentSuccessful) {
  updateMetricDisplay("trialCount", gameState.trialCount);
  updateMetricDisplay("netRate", metrics.netRate);
  updateMetricDisplay("percentSuccessful", percentSuccessful.toFixed(2) + "%");
  updateMetricDisplay("ntpm", metrics.ntpm.toFixed(2));
  updateMetricDisplay("bps", metrics.bps.toFixed(2));
  updateMetricDisplay("fittsBps", metrics.fittsBps.toFixed(2));
  updateMetricDisplay(
    "nearTargetTime",
    (metrics.nearTargetTime / 1000).toFixed(2) + "s"
  );
  updateMetricDisplay(
    "inTargetTime",
    (metrics.inTargetTime / 1000).toFixed(2) + "s"
  );
  updateMetricDisplay(
    "clickGenerationTime",
    (metrics.clickGenerationTime / 1000).toFixed(2) + "s"
  );
}

function updateClickTimeMetrics() {
  if (gameState.clickTimestamps.length > 1) {
    const lastClickTime =
      (gameState.clickTimestamps[gameState.clickTimestamps.length - 1] -
        gameState.clickTimestamps[gameState.clickTimestamps.length - 2]) /
      1000;
    updateMetricDisplay("lastClick", lastClickTime.toFixed(2) + "s");

    const clickIntervals = gameState.clickTimestamps
      .slice(1)
      .map((time, index) => (time - gameState.clickTimestamps[index]) / 1000);
    const fastestClick = Math.min(...clickIntervals);
    updateMetricDisplay("fastestClick", fastestClick.toFixed(2) + "s");

    const totalTime =
      (gameState.clickTimestamps[gameState.clickTimestamps.length - 1] -
        gameState.clickTimestamps[0]) /
      1000;
    const averageClickTime = totalTime / (gameState.clickTimestamps.length - 1);
    updateMetricDisplay("averageClickTime", averageClickTime.toFixed(2) + "s");
  }
}

function updateCountdown(elapsedTimeSeconds) {
  const countdown = max(CONFIG.gameDuration - floor(elapsedTimeSeconds), 0);
  updateMetricDisplay("countdown", countdown);

  if (countdown === 0 && !gameState.timerEnded) {
    gameState.timerEnded = true;
    createSendMetricsButton();
  }
}

function logOverallFittsLawMetrics() {
  console.log(
    `Overall: Total ID = ${metrics.totalIndexOfDifficulty.toFixed(
      2
    )}, Total Time = ${metrics.totalAcquireTime.toFixed(
      2
    )}s, Fitts' BPS = ${metrics.fittsBps.toFixed(2)} bits/s`
  );
}

function pickNewTarget() {
  do {
    gameState.targetX = floor(random(CONFIG.gridSize));
    gameState.targetY = floor(random(CONFIG.gridSize));
  } while (
    gameState.targetX === gameState.lastClickX &&
    gameState.targetY === gameState.lastClickY
  );
}

function resetMetrics() {
  gameState.trialCount = 0;
  gameState.successfulClicks = 0;
  gameState.misclicks = 0;
  metrics.netRate = 0;
  gameState.clickTimestamps = [];
  metrics.totalIndexOfDifficulty = 0;
  metrics.totalAcquireTime = 0;
  metrics.nearTargetTime = 0;
  metrics.inTargetTime = 0;
  metrics.clickGenerationTime = 0;
  resetTimingStates();
}

function resetTimingStates() {
  metrics.isNearTarget = false;
  metrics.isInTarget = false;
  metrics.lastNearTargetTime = 0;
  metrics.lastInTargetTime = 0;
  metrics.clickGenerationStartTime = 0;
  metrics.currentClickGenerationTime = 0;
}

function createMetricsDisplay() {
  let metricsDiv = createDiv().id("metrics");
  METRIC_IDS.forEach((id) => {
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
  updateMetricDisplay("countdown", CONFIG.gameDuration);
  updateMetricDisplay("gridSize", `${CONFIG.gridSize}x${CONFIG.gridSize}`);
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

function updateMetricDisplay(id, value) {
  select(`#${id}`).html(
    `${
      id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, " $1")
    }: ${value}`
  );
}

function createSendMetricsButton() {
  let sendMetricsButton = createButton("Send Results");
  sendMetricsButton.position(20, windowHeight / 2);
  sendMetricsButton.class("send-metrics-button");
  sendMetricsButton.mousePressed(saveMetricsAndRedirect);
}

function saveMetricsAndRedirect() {
  let metricsToSave = {
    trialCount: gameState.trialCount,
    netRate: metrics.netRate,
    gridSize: `${CONFIG.gridSize}x${CONFIG.gridSize}`,
    percentSuccessful: (
      (gameState.successfulClicks / gameState.trialCount) *
      100
    ).toFixed(2),
    ntpm: metrics.ntpm.toFixed(2),
    bps: metrics.bps.toFixed(2),
    fittsBps: metrics.fittsBps.toFixed(2),
    nearTargetTime: (metrics.nearTargetTime / 1000).toFixed(2),
    inTargetTime: (metrics.inTargetTime / 1000).toFixed(2),
    clickGenerationTime: (metrics.clickGenerationTime / 1000).toFixed(2),
    lastClick: select("#lastClick").html().split(": ")[1],
    fastestClick: select("#fastestClick").html().split(": ")[1],
    averageClickTime: select("#averageClickTime").html().split(": ")[1],
  };

  localStorage.setItem("benchmarkMetrics", JSON.stringify(metricsToSave));
  window.location.href = "../type/type.html";
}

function drawGrid() {
  stroke(128);
  strokeWeight(1);
  for (let i = 0; i < CONFIG.gridSize; i++) {
    for (let j = 0; j < CONFIG.gridSize; j++) {
      noFill();
      rect(
        i * CONFIG.cellSize,
        j * CONFIG.cellSize,
        CONFIG.cellSize,
        CONFIG.cellSize
      );
    }
  }
}

function drawTarget() {
  fill("magenta");
  noStroke();
  rect(
    gameState.targetX * CONFIG.cellSize,
    gameState.targetY * CONFIG.cellSize,
    CONFIG.cellSize,
    CONFIG.cellSize
  );
}

function drawMissedClick() {
  if (gameState.missedClick) {
    fill("white");
    noStroke();
    rect(
      gameState.missedClick.x * CONFIG.cellSize,
      gameState.missedClick.y * CONFIG.cellSize,
      CONFIG.cellSize,
      CONFIG.cellSize
    );
  }
}

function drawHoverHighlight() {
  if (gameState.hoveredX !== -1 && gameState.hoveredY !== -1) {
    stroke(255);
    strokeWeight(2);
    noFill();
    rect(
      gameState.hoveredX * CONFIG.cellSize,
      gameState.hoveredY * CONFIG.cellSize,
      CONFIG.cellSize,
      CONFIG.cellSize
    );
  }
}

function disableDefaultBehaviors() {
  document.addEventListener("contextmenu", (event) => event.preventDefault());
  document.addEventListener("wheel", (event) => event.preventDefault(), {
    passive: false,
  });
  document.addEventListener("touchmove", (event) => event.preventDefault(), {
    passive: false,
  });
}
