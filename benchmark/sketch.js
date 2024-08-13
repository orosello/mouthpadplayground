// Game Configuration
const CONFIG = {
  gridSize: 30,
  cellSize: 24, // pixels
  gameDuration: 60, // seconds
  nearTargetSize: 1,
  originalCellSize: 24, // Store the original cell size
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
  "timer",
  "targetSize",
  "gridSize",
  "trialCount",
  "netRate",
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

let resizeTimeout;
let gameStarted = false;

function setup() {
  checkAndAdjustGridSize();
  const navBar = document.querySelector("nav");
  const navBarHeight = navBar ? navBar.offsetHeight : 50; // Default to 50 if navBar is not found
  const topMargin = 10; // Reduced margin below the nav bar
  const bottomMargin = 10; // Reduced bottom margin

  const availableHeight =
    window.innerHeight - navBarHeight - topMargin - bottomMargin;

  createCanvas(
    CONFIG.gridSize * CONFIG.cellSize,
    min(CONFIG.gridSize * CONFIG.cellSize, availableHeight)
  );

  // Center the canvas
  const canvasElement = document.querySelector("canvas");
  canvasElement.style.position = "absolute";
  canvasElement.style.top = `${navBarHeight + topMargin}px`; // Adjusted margin below the nav bar
  canvasElement.style.left = "50%";
  canvasElement.style.transform = "translateX(-50%)";
  canvasElement.style.zIndex = "2";

  pickNewTarget();
  createMetricsDisplay();
  disableDefaultBehaviors();
  updateInitialMetricDisplay();
  checkZoomLevel();

  // Add event listeners here instead of using p5.js built-in functions
  canvas.addEventListener("mousedown", handleMousePressed);
  canvas.addEventListener("mouseup", handleMouseReleased);

  // Start the game loop
  requestAnimationFrame(gameLoop);

  // Add this function to periodically check zoom level
  setupZoomCheck();

  // Add event listener for window resize
  window.addEventListener("resize", handleResize);
}

function handleResize() {
  if (!gameStarted) {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      checkAndAdjustGridSize();
      const navBar = document.querySelector("nav");
      const navBarHeight = navBar ? navBar.offsetHeight : 50; // Default to 50 if navBar is not found
      const topMargin = 10; // Reduced margin below the nav bar
      const bottomMargin = 10; // Reduced bottom margin

      const availableHeight =
        window.innerHeight - navBarHeight - topMargin - bottomMargin;

      resizeCanvas(
        CONFIG.gridSize * CONFIG.cellSize,
        min(CONFIG.gridSize * CONFIG.cellSize, availableHeight)
      );
      updateInitialMetricDisplay();

      // Re-center the canvas after resizing
      const canvasElement = document.querySelector("canvas");
      canvasElement.style.position = "absolute";
      canvasElement.style.top = `${navBarHeight + topMargin}px`; // Adjusted margin below the nav bar
      canvasElement.style.left = "50%";
      canvasElement.style.transform = "translateX(-50%)";
    }, 250);
  }
}

let lastTime = 0;
let lastHoverUpdate = 0;
const HOVER_UPDATE_INTERVAL = 50; // Update hover every 50ms

function gameLoop(currentTime) {
  if (!lastTime) lastTime = currentTime;
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  updateGame(deltaTime);
  drawGame();

  requestAnimationFrame(gameLoop);
}

function updateGame(deltaTime) {
  const currentTime = millis();
  if (currentTime - lastHoverUpdate > HOVER_UPDATE_INTERVAL) {
    updateHover();
    lastHoverUpdate = currentTime;
  }
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

let lastMousePress = 0;

function handleMousePressed(event) {
  if (event.timeStamp - lastMousePress < 50) return;
  lastMousePress = event.timeStamp;

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
    gameStarted = true;
    window.removeEventListener("resize", handleResize);
    removeAllWarnings();
  }

  recordSuccessfulClick(currentTime, clickedX, clickedY);

  // Add the current click generation time to the total
  metrics.clickGenerationTime += metrics.currentClickGenerationTime;

  gameState.missedClick = null;
  pickNewTarget();
  resetTimingStates();

  // Force a redraw to update the target position immediately
  drawGame();
}

function startGame(currentTime) {
  gameState.startTime = currentTime;
  gameState.gameStarted = true;
  resetMetrics();
  gameState.lastClickX = -1; // Set to -1 to ensure first click is recorded properly
  gameState.lastClickY = -1;
  gameState.trialCount = 0;
  gameState.successfulClicks = 0;
  updateMetricDisplay("trialCount", gameState.trialCount);

  // Move the target for the first time
  pickNewTarget();
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
  const elapsedTimeSeconds = min(
    (millis() - gameState.startTime) / 1000,
    CONFIG.gameDuration
  );
  const elapsedTimeMinutes = elapsedTimeSeconds / 60;

  if (elapsedTimeSeconds > 0 && elapsedTimeSeconds <= CONFIG.gameDuration) {
    calculateAndUpdateMetrics(elapsedTimeMinutes, elapsedTimeSeconds);
    updateCountdown(elapsedTimeSeconds);
    logOverallFittsLawMetrics();
  }

  if (elapsedTimeSeconds >= CONFIG.gameDuration && !gameState.timerEnded) {
    gameState.timerEnded = true;
    endGame();
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

  updateMetricDisplays(percentSuccessful, elapsedTimeSeconds);
  updateClickTimeMetrics();
}

function updateMetricDisplays(percentSuccessful, elapsedTimeSeconds) {
  updateMetricDisplay("timer", elapsedTimeSeconds.toFixed(2) + "s");
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
  updateMetricDisplay("timer", elapsedTimeSeconds.toFixed(2) + "s");

  if (countdown === 0 && !gameState.timerEnded) {
    gameState.timerEnded = true;
    endGame();
  }
}

function endGame() {
  // Hide canvas
  document.querySelector("canvas").style.display = "none";

  // Create and show score display and large buttons
  createScoreDisplay();
  createLargeButtons();
}

function createScoreDisplay() {
  const scoreContainer = document.createElement("div");
  scoreContainer.style.position = "absolute";
  scoreContainer.style.top = "30%";
  scoreContainer.style.left = "50%";
  scoreContainer.style.transform = "translate(-50%, -50%)";
  scoreContainer.style.textAlign = "center";
  scoreContainer.style.fontFamily = "'Press Start 2P', cursive";
  scoreContainer.style.color = "white";

  const bpsScore = document.createElement("h1");
  bpsScore.textContent = `${metrics.bps.toFixed(2)}`;
  bpsScore.style.fontSize = "75px";
  bpsScore.style.margin = "0";
  bpsScore.style.textShadow = "none";
  bpsScore.style.webkitTextStroke = "0";

  const scoreText = document.createElement("h2");
  scoreText.textContent = "Your BPS Score";
  scoreText.style.fontSize = "20px";
  scoreText.style.margin = "10px 0 0 0";

  scoreContainer.appendChild(bpsScore);
  scoreContainer.appendChild(scoreText);
  document.body.appendChild(scoreContainer);
}

function createLargeButtons() {
  const buttonContainer = document.createElement("div");
  buttonContainer.style.position = "absolute";
  buttonContainer.style.top = "60%";
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
  metricsDiv.style.position = "fixed";
  metricsDiv.style.top = "80px";
  metricsDiv.style.right = "20px";
  metricsDiv.style.zIndex = "1";
  metricsDiv.style.pointerEvents = "none";
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
  updateMetricDisplay("timer", "0.00s");
  updateMetricDisplay("targetSize", CONFIG.cellSize + "px");
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
  updateMetricDisplay("lastClick", "0.00s");
  updateMetricDisplay("fastestClick", "0.00s");
  updateMetricDisplay("averageClickTime", "0.00s");
  updateMetricDisplay("countdown", CONFIG.gameDuration);
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

  // Add this condition to change the color of "Target Size" text
  if (id === "targetSize" && CONFIG.cellSize !== 24) {
    element.style.color = "magenta";
  } else {
    element.style.color = ""; // Reset color for other metrics
  }
}

function saveMetricsAndRedirect() {
  let metricsToSave = {
    timer: min(
      (millis() - gameState.startTime) / 1000,
      CONFIG.gameDuration
    ).toFixed(2),
    targetSize: CONFIG.cellSize,
    gridSize: CONFIG.gridSize,
    trialCount: gameState.trialCount,
    netRate: metrics.netRate,
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
    originalTargetSize: CONFIG.originalCellSize,
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

function displayWarning(id, message) {
  let warningDiv = document.getElementById(id);

  if (!warningDiv) {
    warningDiv = document.createElement("div");
    warningDiv.id = id;
    document.body.appendChild(warningDiv);
  }

  warningDiv.style.position = "fixed";
  warningDiv.style.bottom = "20px";
  warningDiv.style.left = "50%";
  warningDiv.style.transform = "translateX(-50%)";
  warningDiv.style.backgroundColor = "rgba(255, 0, 255, 0.6)";
  warningDiv.style.color = "white";
  warningDiv.style.padding = "15px";
  warningDiv.style.borderRadius = "5px";
  warningDiv.style.zIndex = "10000";
  warningDiv.style.fontFamily = "'Press Start 2P', cursive";
  warningDiv.style.fontSize = "14px";
  warningDiv.style.textAlign = "center";
  warningDiv.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
  warningDiv.style.display = "block";
  warningDiv.innerHTML = `${message}<br>Click to dismiss.`;

  warningDiv.addEventListener("click", () => {
    warningDiv.style.display = "none";
  });
}

function displaySizeWarning() {
  displayWarning(
    "size-warning",
    "Warning: Grid size is being scaled to fit your system and browser's resolution."
  );
}

function displayZoomWarning() {
  displayWarning(
    "zoom-warning",
    "Please adjust your browser zoom to 100% for optimal performance"
  );
}

function removeWarning(id) {
  const warningDiv = document.getElementById(id);
  if (warningDiv) {
    warningDiv.remove();
    console.log(`${id} removed`);
  } else {
    console.log(`No ${id} to remove`);
  }
}

function removeSizeWarning() {
  removeWarning("size-warning");
}

function removeZoomWarning() {
  removeWarning("zoom-warning");
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

function checkZoomLevel() {
  if (gameStarted) return; // Don't check zoom level if game has started

  const zoomLevel = Math.round((window.innerWidth / window.outerWidth) * 100);
  const warningDiv = document.getElementById("zoom-warning");

  if (Math.abs(zoomLevel - 100) > 5) {
    // Allow a small margin of error
    if (!warningDiv) {
      displayZoomWarning();
    }
  } else {
    removeZoomWarning();
  }
}

function displayZoomWarning() {
  displayWarning(
    "zoom-warning",
    "Please adjust your browser zoom to 100% for optimal performance"
  );
}

function removeZoomWarning() {
  removeWarning("zoom-warning");
}

// Add this function to periodically check zoom level
function setupZoomCheck() {
  const zoomCheckInterval = setInterval(() => {
    if (gameStarted) {
      clearInterval(zoomCheckInterval);
      return;
    }
    checkZoomLevel();
  }, 1000); // Check every second
}

function handleResize() {
  if (!gameStarted) {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      checkAndAdjustGridSize();
      const navBar = document.querySelector("nav");
      const navBarHeight = navBar ? navBar.offsetHeight : 50; // Default to 50 if navBar is not found
      const topMargin = 10; // Reduced margin below the nav bar
      const bottomMargin = 10; // Reduced bottom margin

      const availableHeight =
        window.innerHeight - navBarHeight - topMargin - bottomMargin;

      resizeCanvas(
        CONFIG.gridSize * CONFIG.cellSize,
        min(CONFIG.gridSize * CONFIG.cellSize, availableHeight)
      );
      updateInitialMetricDisplay();

      // Re-center the canvas after resizing
      const canvasElement = document.querySelector("canvas");
      canvasElement.style.position = "absolute";
      canvasElement.style.top = `${navBarHeight + topMargin}px`; // Adjusted margin below the nav bar
      canvasElement.style.left = "50%";
      canvasElement.style.transform = "translateX(-50%)";
    }, 250);
  }
}

function checkAndAdjustGridSize() {
  const minWidth = 720;
  const minHeight = 540;
  const availableWidth = window.innerWidth;
  const navBar = document.querySelector("nav");
  const navBarHeight = navBar ? navBar.offsetHeight : 50; // Default to 50 if navBar is not found
  const topMargin = 10; // Reduced margin below the nav bar
  const bottomMargin = 10; // Reduced bottom margin
  const availableHeight =
    window.innerHeight - navBarHeight - topMargin - bottomMargin;

  console.log(`Available dimensions: ${availableWidth}x${availableHeight}`);

  const maxGridWidth = availableWidth;
  const maxGridHeight = availableHeight;
  const maxCellSize = Math.min(
    maxGridWidth / CONFIG.gridSize,
    maxGridHeight / CONFIG.gridSize
  );

  console.log(
    `Max cell size: ${maxCellSize}, Original cell size: ${CONFIG.originalCellSize}`
  );

  if (maxCellSize >= CONFIG.originalCellSize) {
    CONFIG.cellSize = CONFIG.originalCellSize;
    console.log("Using original cell size");
    removeSizeWarning();
  } else if (maxCellSize >= 12) {
    CONFIG.cellSize = Math.floor(maxCellSize);
    console.log(`Using adjusted cell size: ${CONFIG.cellSize}`);
    removeSizeWarning();
    displaySizeWarning(); // Display warning when cell size is adjusted
  } else {
    const scaleFactor = Math.min(
      availableWidth / minWidth,
      availableHeight / minHeight
    );
    CONFIG.cellSize = Math.max(
      12,
      Math.floor(CONFIG.originalCellSize * scaleFactor)
    );
    console.log(`Scaling down, new cell size: ${CONFIG.cellSize}`);
    displaySizeWarning(); // Display warning when cell size is scaled down
  }

  console.log(`Final cell size: ${CONFIG.cellSize}`);

  // Update the target size display
  updateMetricDisplay("targetSize", CONFIG.cellSize + "px");
}

function displaySizeWarning() {
  displayWarning(
    "size-warning",
    "Warning: Grid size is being scaled to fit your system and browser's resolution."
  );
}

function removeSizeWarning() {
  removeWarning("size-warning");
}
