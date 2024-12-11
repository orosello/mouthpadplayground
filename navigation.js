document.write(`
    <!-- Navigation Bar -->
    <script src="../scripts.js"></script>
    <button class="button" data-action="goToPreviousGame">Previous</button>
    <button class="button" data-action="goToNextGame">Next</button>
    <button class="button" data-action="reloadGame">Reset</button>
    <button class="button" data-action="goToMenu">Menu</button>
`);

// Prevent touch events on navigation buttons from propagating to canvas
document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".button");
  buttons.forEach((button) => {
    button.addEventListener("touchstart", function (e) {
      e.stopPropagation();
    });
    button.addEventListener("touchend", function (e) {
      e.stopPropagation();
      e.preventDefault();
    });
  });
});
