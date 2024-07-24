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
  fittsBPS: 0,
  nearTargetTime: 0,
  inTargetTime: 0,
  clickGenerationTime: 0,
  lastNearTargetTime: 0,
  lastInTargetTime: 0,
  isNearTarget: false,
  isInTarget: false,
  clickGenerationStartTime: 0,
  currentClickGenerationTime: 0,
  timeToNearTarget: 0,
};

const METRIC_IDS = [
  "trialCount",
  "netRate",
  "gridSize",
  "percentSuccessful",
  "NTPM",
  "BPS",
  "BPSfitts",
  "timeToNearTarget",
  "nearTargetTime",
  "inTargetTime",
  "clickGenerationTime",
  "lastClick",
  "fastestClick",
  "averageClickTime",
  "countdown",
];

const metricElements = {};

function setup() {
  createCanvas(
    CONFIG.gridSize * CONFIG.cellSize,
    CONFIG.gridSize * CONFIG.cellSize
  );
  pickNewTarget();
  createMetricsDisplay();
  disableDefaultBehaviors();
  updateInitialMetricDisplay();

  // Add event listeners here instead of using p5.js built-in functions
  canvas.addEventListener("mousedown", handleMousePressed);
  canvas.addEventListener("mouseup", handleMouseReleased);

  // Start the game loop
  requestAnimationFrame(gameLoop);
}

let lastTime = 0;
function gameLoop(currentTime) {
  if (!lastTime) lastTime = currentTime;
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  updateGame(deltaTime);
  drawGame();

  requestAnimationFrame(gameLoop);
}

function updateGame(deltaTime) {
  updateHover();
  updateTimingMetrics();
  if (gameState.gameStarted && !gameState.timerEnded) {
    updateMetrics();
  }
}

function drawGame() {
  background(0);
  drawGrid();
  drawTarget();
  drawMissedClick();
  drawHoverHighlight();
}

function handleMousePressed(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

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

function handleMouseReleased() {
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

    const clickFittsBPS = indexOfDifficulty / acquireTime;
    console.log(
      `Click ${gameState.successfulClicks}: Distance = ${distance.toFixed(
        2
      )}, ID = ${indexOfDifficulty.toFixed(2)}, Time = ${acquireTime.toFixed(
        2
      )}s, Fitts' BPS = ${clickFittsBPS.toFixed(2)} bits/s`
    );
  }
}

function handleMissedClick(clickedX, clickedY) {
  gameState.trialCount++;
  gameState.misclicks++;
  gameState.missedClick = { x: clickedX, y: clickedY };
}

function updateHover() {
  const { cellSize, gridSize } = CONFIG;
  gameState.hoveredX = floor(mouseX / cellSize);
  gameState.hoveredY = floor(mouseY / cellSize);

  if (
    gameState.hoveredX < 0 ||
    gameState.hoveredX >= gridSize ||
    gameState.hoveredY < 0 ||
    gameState.hoveredY >= gridSize
  ) {
    gameState.hoveredX = -1;
    gameState.hoveredY = -1;
  }
}

function checkIfNearTarget(x, y, targetX, targetY) {
  const { nearTargetSize } = CONFIG;
  return (
    Math.abs(x - targetX) <= nearTargetSize &&
    Math.abs(y - targetY) <= nearTargetSize &&
    (x !== targetX || y !== targetY)
  );
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
  } else {
    if (metrics.isInTarget) {
      metrics.clickGenerationStartTime = 0; // Reset click generation time when leaving target
    }
    metrics.isInTarget = false;
    metrics.lastInTargetTime = 0;
  }

  // Update current click generation time
  if (metrics.clickGenerationStartTime > 0) {
    metrics.currentClickGenerationTime =
      currentTime - metrics.clickGenerationStartTime;
  } else {
    metrics.currentClickGenerationTime = 0;
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
    metrics.fittsBPS =
      metrics.totalIndexOfDifficulty / metrics.totalAcquireTime;
  }

  const totalClicks = gameState.successfulClicks + gameState.misclicks;
  const percentSuccessful =
    totalClicks > 0 ? (gameState.successfulClicks / totalClicks) * 100 : 0;

  // Calculate time to near target
  metrics.timeToNearTarget = Math.max(
    0,
    elapsedTimeSeconds - (metrics.nearTargetTime + metrics.inTargetTime) / 1000
  );

  updateMetricDisplays(percentSuccessful);
  updateClickTimeMetrics();
}

function updateMetricDisplays(percentSuccessful) {
  updateMetricDisplay("trialCount", gameState.trialCount);
  updateMetricDisplay("netRate", metrics.netRate);
  updateMetricDisplay("percentSuccessful", percentSuccessful.toFixed(2) + "%");
  updateMetricDisplay("NTPM", metrics.ntpm.toFixed(2));
  updateMetricDisplay("BPS", metrics.bps.toFixed(2));
  updateMetricDisplay("BPSfitts", metrics.fittsBPS.toFixed(2));
  updateMetricDisplay(
    "timeToNearTarget",
    metrics.timeToNearTarget.toFixed(2) + "s"
  );
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
    updateMetricDisplay("lastClick", lastClickTime.toFixed(2));

    const clickIntervals = gameState.clickTimestamps
      .slice(1)
      .map((time, index) => (time - gameState.clickTimestamps[index]) / 1000);
    const fastestClick = Math.min(...clickIntervals);
    updateMetricDisplay("fastestClick", fastestClick.toFixed(2));

    const totalTime =
      (gameState.clickTimestamps[gameState.clickTimestamps.length - 1] -
        gameState.clickTimestamps[0]) /
      1000;
    const averageClickTime = totalTime / (gameState.clickTimestamps.length - 1);
    updateMetricDisplay("averageClickTime", averageClickTime.toFixed(2));
  }
}

function updateCountdown(elapsedTimeSeconds) {
  const countdown = max(CONFIG.gameDuration - floor(elapsedTimeSeconds), 0);
  updateMetricDisplay("countdown", countdown);

  if (countdown === 0 && !gameState.timerEnded) {
    gameState.timerEnded = true;
    endGame();
  }
}

function endGame() {
  // Hide canvas
  document.querySelector("canvas").style.display = "none";

  // Create and show large buttons
  createLargeButtons();
}

function createLargeButtons() {
  const buttonContainer = document.createElement("div");
  buttonContainer.style.position = "absolute";
  buttonContainer.style.top = "50%";
  buttonContainer.style.left = "50%";
  buttonContainer.style.transform = "translate(-50%, -50%)";
  buttonContainer.style.display = "flex";
  buttonContainer.style.gap = "20px";

  const sendResultsButton = createLargeButton(
    "Send Results",
    saveMetricsAndRedirect
  );
  const retryButton = createLargeButton("Retry", () => location.reload());

  buttonContainer.appendChild(sendResultsButton);
  buttonContainer.appendChild(retryButton);
  document.body.appendChild(buttonContainer);
}

function createLargeButton(text, onClick) {
  const button = document.createElement("button");
  button.textContent = text;
  button.style.fontSize = "24px";
  button.style.fontFamily = "'Press Start 2P', cursive";
  button.style.padding = "15px 30px";
  button.style.cursor = "pointer";
  button.style.backgroundColor = "black";
  button.style.color = "white";
  button.style.border = "2px solid white";
  button.style.borderRadius = "5px";
  button.style.textTransform = "uppercase";
  button.style.transition = "background-color 0.3s, color 0.3s";

  // Hover effect
  button.addEventListener("mouseover", () => {
    button.style.backgroundColor = "white";
    button.style.color = "black";
  });

  button.addEventListener("mouseout", () => {
    button.style.backgroundColor = "black";
    button.style.color = "white";
  });

  button.addEventListener("click", onClick);
  return button;
}

function logOverallFittsLawMetrics() {
  console.log(
    `Overall: Total ID = ${metrics.totalIndexOfDifficulty.toFixed(
      2
    )}, Total Time = ${metrics.totalAcquireTime.toFixed(
      2
    )}s, Fitts' BPS = ${metrics.fittsBPS.toFixed(2)} bits/s`
  );
}

function pickNewTarget() {
  const { gridSize } = CONFIG;
  let newX, newY;
  do {
    newX = floor(random(gridSize));
    newY = floor(random(gridSize));
  } while (newX === gameState.lastClickX && newY === gameState.lastClickY);

  gameState.targetX = newX;
  gameState.targetY = newY;
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
  metrics.timeToNearTarget = 0;
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
  let metricsDiv = document.createElement("div");
  metricsDiv.id = "metrics";
  METRIC_IDS.forEach((id) => {
    let metricElement = document.createElement("div");
    metricElement.className = "metric";
    metricElement.id = id;
    metricElement.textContent = `${
      id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, " $1")
    }: 0`;
    metricsDiv.appendChild(metricElement);
    metricElements[id] = metricElement;
  });
  document.body.appendChild(metricsDiv);
}

function updateInitialMetricDisplay() {
  updateMetricDisplay("countdown", CONFIG.gameDuration);
  updateMetricDisplay("gridSize", CONFIG.gridSize);
  updateMetricDisplay("trialCount", 0);
  updateMetricDisplay("netRate", 0);
  updateMetricDisplay("percentSuccessful", "0.00%");
  updateMetricDisplay("NTPM", "0.00");
  updateMetricDisplay("BPS", "0.00");
  updateMetricDisplay("BPSfitts", "0.00");
  updateMetricDisplay("timeToNearTarget", "0.00s");
  updateMetricDisplay("nearTargetTime", "0.00s");
  updateMetricDisplay("inTargetTime", "0.00s");
  updateMetricDisplay("clickGenerationTime", "0.00s");
  updateMetricDisplay("lastClick", "0.00");
  updateMetricDisplay("fastestClick", "0.00");
  updateMetricDisplay("averageClickTime", "0.00");
}

function updateMetricDisplay(id, value) {
  const element = metricElements[id];
  if (!element) {
    console.warn(`Element with id '${id}' not found`);
    return;
  }

  if (id === "countdown") {
    // Special handling for countdown
    if (value <= 60) {
      element.textContent = value;
      element.style.fontSize = "5em"; // Make font 5 times larger
      element.style.fontWeight = "bold";
      element.style.marginTop = "20px"; // Move 5px down
      element.style.display = "block"; // Ensure it's on its own line
    } else {
      element.textContent = "60"; // Display 60 at the start
    }
    return;
  }

  let displayName = id;
  if (!["BPS", "NTPM", "BPSfitts"].includes(id)) {
    displayName =
      id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, " $1");
  }

  // Adjust display names for specific metrics
  switch (id) {
    case "BPS":
      displayName = "BPS (NLink)";
      break;
    case "BPSfitts":
      displayName = "BPS (Fitts)";
      break;
    case "percentSuccessful":
      displayName = "Success";
      break;
    case "clickGenerationTime":
      displayName = "Click Gen Time";
      break;
    case "averageClickTime":
      displayName = "Avg Click Time";
      break;
    case "timeToNearTarget":
      displayName = "Time to Near Trgt";
      break;
  }

  // Add 's' to last click, fastest click, and average click time if not already present
  if (
    ["lastClick", "fastestClick", "averageClickTime"].includes(id) &&
    !value.toString().endsWith("s")
  ) {
    value = value + "s";
  }

  element.textContent = `${displayName}: ${value}`;
  element.style.fontSize = ""; // Reset font size for other metrics
  element.style.fontWeight = ""; // Reset font weight for other metrics
  element.style.marginTop = ""; // Reset margin for other metrics
  element.style.display = ""; // Reset display for other metrics
}

function saveMetricsAndRedirect() {
  let metricsToSave = {
    trialCount: gameState.trialCount,
    netRate: metrics.netRate,
    gridSize: CONFIG.gridSize,
    percentSuccessful: (
      (gameState.successfulClicks / gameState.trialCount) *
      100
    ).toFixed(2),
    NTPM: metrics.ntpm.toFixed(2),
    BPS: metrics.bps.toFixed(2),
    BPSfitts: metrics.fittsBPS.toFixed(2),
    timeToNearTarget: metrics.timeToNearTarget.toFixed(2),
    nearTargetTime: (metrics.nearTargetTime / 1000).toFixed(2),
    inTargetTime: (metrics.inTargetTime / 1000).toFixed(2),
    clickGenerationTime: (metrics.clickGenerationTime / 1000).toFixed(2),
    lastClick: document
      .getElementById("lastClick")
      .textContent.split(": ")[1]
      .replace("s", ""),
    fastestClick: document
      .getElementById("fastestClick")
      .textContent.split(": ")[1]
      .replace("s", ""),
    averageClickTime: document
      .getElementById("averageClickTime")
      .textContent.split(": ")[1]
      .replace("s", ""),
  };

  // Log the metrics to the console
  console.log("Benchmark Metrics:", metricsToSave);

  localStorage.setItem("benchmarkMetrics", JSON.stringify(metricsToSave));
  window.location.href = "../type/type.html";
}

function drawGrid() {
  stroke(128);
  strokeWeight(1);
  for (let i = 0; i <= CONFIG.gridSize; i++) {
    line(i * CONFIG.cellSize, 0, i * CONFIG.cellSize, height);
    line(0, i * CONFIG.cellSize, width, i * CONFIG.cellSize);
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
