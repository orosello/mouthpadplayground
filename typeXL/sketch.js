let inputText = '';
let blink = true;
let lastBlinkTime = 0;
let customFont;

function preload() {
  // Load your custom font; replace 'your_font_file.ttf' with the path to your font file
  customFont = loadFont('../assets/led-counter-7/led_counter-7.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(customFont); // Use the custom font
  textSize(50); // Adjust text size as needed, doubled from 32 to 64
  let hiddenInput = select('#textInput');
  hiddenInput.elt.focus();
  hiddenInput.elt.onblur = () => hiddenInput.elt.focus();
  select('#textInput').input(() => {
    inputText = select('#textInput').value();
  });
}

function draw() {
  background(0); // Changed background color to black

  // Draw the input text and blinking cursor
  fill(255); // Changed font color to white
  noStroke();
  text(inputText + (blink ? '|' : ''), width / 2 - textWidth(inputText) / 2, height / 2);

  // Blink the cursor every 500ms, cursor size doubled
  if (millis() - lastBlinkTime > 500) {
    blink = !blink;
    lastBlinkTime = millis();
  }
}

function mousePressed() {
  // This function is no longer needed for on-screen keyboard interaction
}

function keyPressed() {
  if (keyCode === BACKSPACE) { // Handle the backspace key
    // Prevent default backspace behavior to avoid navigating back in browser history
    inputText = inputText.slice(0, -1);
    select('#textInput').value(inputText); // Update hidden input value
    return false; // Prevent any default behavior
  }
}