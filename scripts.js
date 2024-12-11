// Define the different module sequences
const regularGameOrder = [
  "../edgeNavigation/edgeNavigation.html",
  "../chaseBall/chaseBall.html",
  "../OnOff/onOff.html",
  "../fitts/fitts.html",
  "../chaseBallRightClick/chaseBallRightClick.html",
  "../chaseBallDoubleClick/chaseBallDoubleClick.html",
  "../orbit/orbit.html",
  "../dragHole/dragHole.html",
  "../paint/paint.html",
  "../scrollText/scrollText.html",
  "../benchmark/benchmark.html",
  "../pong/pong.html",
  "../flappyBirds/flappyBirds.html",
  "../AngryLicks2/angryLicks2.html",
  "../NeuraLick/neuraLick.html",
  "../type/type.html",
  "../pongVertical/pongVertical.html",
];

const ipadGameOrder = [
  "../edgeNavigation/edgeNavigation.html", // I1
  "../chaseBall/chaseBall.html", // I2
  "../OnOff/onOff.html", // I3
  "../fitts/fitts.html", // I4
  "../orbit/orbit.html", // I5
  "../dragHole/dragHole.html", // I6
  "../paint/paint.html", // I7
  "../scrollText/scrollText.html", // I8
  "../chaseBallRightClick/chaseBallRightClick.html", // I9
  "../pong/pong.html", // I10
  "../benchmark/benchmark.html", // I11
];

// Store the current game order
let currentGameOrder = [...regularGameOrder];

// Function to check if we're in iPad onboarding mode
function isIpadOnboarding() {
  // Check if the current page URL contains any of the iPad onboarding modules
  const currentPath = window.location.pathname;
  return (
    document.querySelector(
      '.game-link.ipad-onboarding[href*="' + currentPath.split("/").pop() + '"]'
    ) !== null
  );
}

// Function to get current game index
function getCurrentGameIndex() {
  const currentGame = window.location.pathname.split("/").pop();
  return currentGameOrder.findIndex((game) => game.includes(currentGame));
}

// Navigation functions
function goToPreviousGame() {
  const currentIndex = getCurrentGameIndex();
  if (currentIndex > 0) {
    window.location.href = currentGameOrder[currentIndex - 1];
  }
}

function goToNextGame() {
  const currentIndex = getCurrentGameIndex();
  if (currentIndex < currentGameOrder.length - 1) {
    window.location.href = currentGameOrder[currentIndex + 1];
  }
}

function reloadGame() {
  window.location.reload();
}

function goToMenu() {
  window.location.href = "../index.html";
}

// Set up event listeners when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if we're starting in iPad onboarding mode
  if (isIpadOnboarding()) {
    currentGameOrder = [...ipadGameOrder];
  }

  // Add click handlers for iPad onboarding links
  const ipadLinks = document.querySelectorAll(".game-link.ipad-onboarding");
  ipadLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      currentGameOrder = [...ipadGameOrder];
      // Store the current mode in sessionStorage
      sessionStorage.setItem("gameMode", "ipad");
      window.location.href = link.href;
    });
  });

  // Add click handlers for regular module links
  const regularLinks = document.querySelectorAll(
    ".game-link:not(.ipad-onboarding)"
  );
  regularLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      currentGameOrder = [...regularGameOrder];
      // Store the current mode in sessionStorage
      sessionStorage.setItem("gameMode", "regular");
      window.location.href = link.href;
    });
  });

  // Restore the correct game order based on stored mode
  const storedMode = sessionStorage.getItem("gameMode");
  if (storedMode === "ipad") {
    currentGameOrder = [...ipadGameOrder];
  } else if (storedMode === "regular") {
    currentGameOrder = [...regularGameOrder];
  }
});
