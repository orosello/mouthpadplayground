let inputText = "";
let blink = true;
let lastBlinkTime = 0;
let customFont;

function preload() {
  customFont = loadFont("../assets/led-counter-7/led_counter-7.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(customFont);
  textSize(90);
  let hiddenInput = select("#textInput");
  hiddenInput.elt.focus();
  hiddenInput.elt.onblur = () => hiddenInput.elt.focus();
  select("#textInput").input(() => {
    inputText = select("#textInput").value();
  });
}

function draw() {
  background(0);

  fill(255);
  noStroke();
  text(
    inputText + (blink ? "|" : ""),
    width / 2 - textWidth(inputText) / 2,
    height / 2
  );

  // Blink the cursor every 500ms, cursor size doubled
  if (millis() - lastBlinkTime > 500) {
    blink = !blink;
    lastBlinkTime = millis();
  }
}

function keyPressed() {
  if (keyCode === BACKSPACE) {
    //

    inputText = inputText.slice(0, -1);
    select("#textInput").value(inputText);
    return false;
  }
}
