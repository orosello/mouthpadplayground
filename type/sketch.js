let inputText = '';
let blink = true;
let lastBlinkTime = 0;
let customFont;
let keyWidth = 40;
let keyHeight = 40;
let totalKeysPerRow = 10; // Assuming 10 keys per row for QWERTYUIOP, etc.

function preload() {
  // Load your custom font; replace 'your_font_file.ttf' with the path to your font file
  customFont = loadFont('../assets/led-counter-7/led_counter-7.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(customFont); // Use the custom font
  textSize(32); // Adjust text size as needed
}

function draw() {
  background(220);

  // Draw the input text and blinking cursor
  fill(0);
  noStroke();
  text(inputText + (blink ? '|' : ''), width / 2 - textWidth(inputText) / 2, height / 2);

  // Blink the cursor every 500ms
  if (millis() - lastBlinkTime > 500) {
    blink = !blink;
    lastBlinkTime = millis();
  }

  // Draw the on-screen keyboard below the text
  drawKeyboard();
}

function drawKeyboard() {
  let keys = "QWERTYUIOPASDFGHJKLZXCVBNM";
  let startX = width / 2 - (totalKeysPerRow * keyWidth) / 2; // Center the keyboard horizontally
  let startY = height / 2 + 50; // Position the keyboard vertically below the text

  for (let i = 0; i < keys.length; i++) {
    let x = startX + (i % totalKeysPerRow) * keyWidth;
    let y = startY + Math.floor(i / totalKeysPerRow) * keyHeight;
    fill(255);
    stroke(0);
    rect(x, y, keyWidth, keyHeight, 5); // Draw key
    fill(0);
    noStroke();
    text(keys[i], x + keyWidth / 2 - textWidth(keys[i]) / 2, y + keyHeight / 2 + 10); // Draw letter
  }
}

function mousePressed() {
  let startX = width / 2 - (totalKeysPerRow * keyWidth) / 2; // Center the keyboard horizontally
  let startY = height / 2 + 50; // Position the keyboard vertically below the text
  let keys = "QWERTYUIOPASDFGHJKLZXCVBNM";

  for (let i = 0; i < keys.length; i++) {
    let x = startX + (i % totalKeysPerRow) * keyWidth;
    let y = startY + Math.floor(i / totalKeysPerRow) * keyHeight;
    // Check if the mouse click is within the bounds of the key
    if (mouseX > x && mouseX < x + keyWidth && mouseY > y && mouseY < y + keyHeight) {
      inputText += keys[i];
      break; // Exit the loop once the correct key is found
    }
  }
}
