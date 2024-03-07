const gameOrder = [
  "/edgeNavigation/edgeNavigation.html",
  "/chaseBall/chaseBall.html",
  "/OnOff/onOff.html",
  "/fitts/fitts.html",
  "/chaseBallRightClick/chaseBallRightClick.html",
  "/chaseBallDoubleClick/chaseBallDoubleClick.html",
  "/orbit/orbit.html",
  "/dragHole/dragHole.html",
  "/paint/paint.html",
  "/pong/pong.html",
  "/flappyBirds/flappyBirds.html",
  "/AngryLicks2/angryLicks2.html",
  "/NeuraLick/neuraLick.html",
  "/type/type.html",
  "/pongVertical/pongVertical.html",
];

function getCurrentGameIndex() {
  const currentGame = window.location.pathname.split("/").pop();
  return gameOrder.findIndex((game) => game.includes(currentGame));
}

function goToPreviousGame() {
  const currentIndex = getCurrentGameIndex();
  if (currentIndex > 0) {
    window.location.href = gameOrder[currentIndex - 1];
  }
}

function goToNextGame() {
  const currentIndex = getCurrentGameIndex();
  if (currentIndex < gameOrder.length - 1) {
    window.location.href = gameOrder[currentIndex + 1];
  }
}

function reloadGame() {
  window.location.reload();
}

function goToMenu() {
  window.location.href = "../index.html"; // Adjust the path as necessary
}
