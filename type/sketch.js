let inputText = "";
let blink = true;
let lastBlinkTime = 0;
let customFont;
let pressStart2PFont;
let keyWidth = 40;
let keyHeight = 40;
let totalKeysPerRow = 10;
let extraKeys = [" ", "<"];
let sendButton;
const googleScriptURL =
  "https://script.google.com/macros/s/AKfycbzGY-z_nl0BS-zKrv700RMDZURv8rhBopmMYUXkxYIlKooLad6Gy0BZrlOXStf8FEot/exec";

let inputDevices = [
  "MouthPad^ (Head Tracking and Tongue Clicks)",
  "MouthPad^ (Tongue Control Only)",
  "Lip/Chin Joystick (e.g., Quadstick, Quadjoy)",
  "Sip-and-Puff (e.g., Jouse)",
  "Head-tracking (e.g., Glassouse)",
  "Eye-tracking (e.g., Tobii)",
  "Mouth stick",
  "Mouse (Standard Handheld)",
  "Trackpad (Standard Laptop)",
  "Other",
].map((device) => device.trim());
let selectedDevice = "";
let checkboxes = [];

function preload() {
  customFont = loadFont("../assets/led-counter-7/led_counter-7.ttf");
  pressStart2PFont = loadFont(
    "../assets/Press_Start_2P/PressStart2P-Regular.ttf"
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(customFont);
  textSize(32);

  createCheckboxes();
  createSendButton();

  // Ensure the body is scrollable and the vertical scrollbar is always visible and accessible
  document.body.style.overflowY = "scroll";
  document.body.style.overflowX = "hidden"; // Hide horizontal scrollbar if not needed
  document.body.style.scrollbarWidth = "auto"; // For Firefox
  document.body.style.scrollbarColor = "gray black"; // For Firefox

  applyScrollbarStyles(); // Apply additional styles for Webkit browsers
}

// Add this function to apply additional styles for Webkit browsers (Chrome, Safari)
function applyScrollbarStyles() {
  const style = document.createElement("style");
  style.innerHTML = `
    ::-webkit-scrollbar {
      width: 16px; /* Increase the width for accessibility */
    }
    ::-webkit-scrollbar-track {
      background: black;
    }
    ::-webkit-scrollbar-thumb {
      background-color: gray;
      border-radius: 10px;
      border: 3px solid black;
    }
  `;
  document.head.appendChild(style);
}

function createCheckboxes() {
  for (let i = 0; i < inputDevices.length; i++) {
    let checkbox = createCheckbox(inputDevices[i], false);
    styleCheckbox(checkbox);
    checkboxes.push(checkbox);
  }
}

function styleCheckbox(checkbox) {
  const grayOptions = [
    "Lip/Chin Joystick (e.g., Quadstick, Quadjoy)",
    "Sip-and-Puff (e.g., Jouse)",
    "Head-tracking (e.g., Glassouse)",
    "Eye-tracking (e.g., Tobii)",
    "Mouth stick",
    "Mouse (Standard Handheld)",
    "Trackpad (Standard Laptop)",
    "Other",
  ];

  if (grayOptions.includes(checkbox.elt.innerText)) {
    checkbox.style("color", "gray");
  } else {
    checkbox.style("color", "white");
  }
  checkbox.style("font-family", '"Press Start 2P", Arial, serif');
  checkbox.style("font-size", "12px");
  checkbox.style("display", "flex");
  checkbox.style("align-items", "center");
  checkbox.style("gap", "5px"); // Reduced gap
  checkbox.style("padding-left", "0px");
  checkbox.style("margin-bottom", "0");
  checkbox.style("line-height", "1"); // Add this line to remove extra vertical space

  let input = checkbox.elt.querySelector("input");
  input.style.width = "20px"; // Reduced size
  input.style.height = "20px"; // Reduced size
  input.style.marginRight = "5px";
  input.style.accentColor = "magenta";
  input.style.verticalAlign = "middle"; // Align checkbox vertically

  let label = checkbox.elt.querySelector("label");
  label.style.display = "flex";
  label.style.alignItems = "center";

  checkbox.changed(onCheckboxChangedRadioBehavior);
}

// Ensure only one checkbox can be selected at a time (radio button behavior)
function onCheckboxChangedRadioBehavior() {
  for (let cb of checkboxes) {
    if (cb !== this) {
      cb.checked(false);
    }
  }
  selectedDevice = this.checked() ? this.elt.innerText : "";
}

function createSendButton() {
  sendButton = createButton("Send");
  sendButton.mousePressed(sendMessage);
  sendButton.style("font-size", "18px");
  sendButton.style("background-color", "black");
  sendButton.style("color", "white");
  sendButton.style("border", "2px solid white");
  sendButton.style("font-family", '"Press Start 2P", Arial, serif');
  sendButton.style("padding", "10px 20px");
  sendButton.style("cursor", "pointer");
}

function draw() {
  background(0);
  drawElements();
}

function drawElements() {
  // Cache frequently used values
  const centerX = width / 2;
  const yOffset = height * 0.05;

  drawInstructions(yOffset);
  drawInputText(yOffset + 50);

  window.keyboardStartY = yOffset + 100;
  drawKeyboard(window.keyboardStartY);

  const devicePromptY = window.keyboardStartY + calculateKeyboardHeight() + 50;
  drawInputDevicesPrompt(devicePromptY);
  drawInputDevices(devicePromptY + 80);
  drawSendButton(devicePromptY + 80 + checkboxes.length * 28 + 20);
}

function drawInstructions(y) {
  textFont(pressStart2PFont);
  textSize(14);
  fill(255);
  textAlign(CENTER, TOP);
  text("1. What's your first and last name?", width / 2, y);
}

function drawInputText(y) {
  textFont(customFont);
  textSize(32);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  text(inputText + (blink ? "|" : ""), width / 2, y);

  if (millis() - lastBlinkTime > 500) {
    blink = !blink;
    lastBlinkTime = millis();
  }
}

function drawKeyboard(startY) {
  const keys = "QWERTYUIOPASDFGHJKLZXCVBNM";
  const startX = width / 2 - (totalKeysPerRow * keyWidth) / 2;

  textAlign(CENTER, CENTER);
  textSize(24);

  // Pre-calculate common values
  const halfKeyWidth = keyWidth / 2;
  const halfKeyHeight = keyHeight / 2;

  for (let i = 0; i < keys.length; i++) {
    const x = startX + (i % totalKeysPerRow) * keyWidth;
    const y = startY + Math.floor(i / totalKeysPerRow) * keyHeight;
    drawKey(x, y, keys[i], halfKeyWidth, halfKeyHeight);
  }

  let extraX = startX;
  const extraY = startY + Math.ceil(keys.length / totalKeysPerRow) * keyHeight;

  for (let i = 0; i < extraKeys.length; i++) {
    drawKey(extraX, extraY, extraKeys[i], halfKeyWidth, halfKeyHeight);
    extraX += keyWidth;
  }
}

function drawKey(x, y, key, halfKeyWidth, halfKeyHeight) {
  noFill();
  stroke(255);
  rect(x, y, keyWidth, keyHeight, 5);
  fill(128);
  noStroke();
  text(key, x + halfKeyWidth, y + halfKeyHeight);
}

function drawInputDevicesPrompt(y) {
  textFont(pressStart2PFont);
  textSize(14);
  fill(255);
  textAlign(CENTER, TOP);
  text("2. Which input device did you use?", width / 2, y);
}

function drawInputDevices(startY) {
  for (let i = 0; i < checkboxes.length; i++) {
    checkboxes[i].position(width / 2 - 200, startY + i * 28); // Reverted to original spacing
  }
}

function drawSendButton(y) {
  sendButton.position(width / 2 - 75, y);
}

function calculateKeyboardHeight() {
  let keys = "QWERTYUIOPASDFGHJKLZXCVBNM";
  let rows = Math.ceil(keys.length / totalKeysPerRow);
  return rows * keyHeight + keyHeight; // Add extra row for space and backspace
}

function mousePressed() {
  let startX = width / 2 - (totalKeysPerRow * keyWidth) / 2;
  let startY = window.keyboardStartY;
  let keys = "QWERTYUIOPASDFGHJKLZXCVBNM";
  let rows = Math.ceil(keys.length / totalKeysPerRow);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < totalKeysPerRow; col++) {
      let index = row * totalKeysPerRow + col;
      if (index >= keys.length) break;

      let x = startX + col * keyWidth;
      let y = startY + row * keyHeight;

      if (isMouseOverKey(x, y)) {
        inputText += keys[index];
        return;
      }
    }
  }

  let extraStartY = startY + rows * keyHeight;
  for (let i = 0; i < extraKeys.length; i++) {
    let x = startX + i * keyWidth;
    if (isMouseOverKey(x, extraStartY)) {
      if (extraKeys[i] === "<") {
        inputText = inputText.slice(0, -1);
      } else {
        inputText += extraKeys[i];
      }
      return;
    }
  }
}

function isMouseOverKey(x, y) {
  return (
    mouseX > x && mouseX < x + keyWidth && mouseY > y && mouseY < y + keyHeight
  );
}

function sendMessage() {
  if (inputText.trim() === "" || selectedDevice === "") {
    console.log("Input text or selected device is empty");
    return;
  }

  let message = inputText.trim();
  let metrics = JSON.parse(localStorage.getItem("benchmarkMetrics"));

  console.log("Preparing to send data:", { message, selectedDevice, metrics });

  let data = {
    name: message,
    inputDevice: selectedDevice.replace(/\s+/g, " ").trim(),
    ...metrics,
  };

  // Show "Thank you!" message immediately
  showThankYouMessage();
  console.log("Thank you message should be displayed now");

  jsonp(googleScriptURL, data, function (response) {
    console.log("JSONP response received:", response);
    if (response && response.result === "success") {
      console.log("Message, metrics, and input device sent successfully!");
      localStorage.removeItem("benchmarkMetrics");
      // Delay redirect by 1 second
      setTimeout(() => {
        console.log("Redirecting to benchmark page");
        window.location.href = "../benchmark/benchmark.html";
      }, 1000);
    } else {
      console.error(
        "Error sending message, metrics, and input device.",
        response
      );
      // Remove "Thank you!" message if there's an error
      removeThankYouMessage();
    }
  });

  inputText = "";
}

// Ensure these functions are defined
function showThankYouMessage() {
  console.log("Attempting to show Thank you message");
  removeThankYouMessage();

  let overlay = createDiv();
  overlay.id("thank-you-overlay");
  overlay.style("position", "fixed");
  overlay.style("top", "0");
  overlay.style("left", "0");
  overlay.style("width", "100%");
  overlay.style("height", "100%");
  overlay.style("background-color", "rgba(0, 0, 0, 0.8)"); // 80% opacity
  overlay.style("display", "flex");
  overlay.style("justify-content", "center");
  overlay.style("align-items", "center");
  overlay.style("z-index", "1000");

  let thankYouDiv = createDiv();
  thankYouDiv.parent(overlay);
  thankYouDiv.style("font-family", '"Press Start 2P", Arial, serif');
  thankYouDiv.style("color", "white");
  thankYouDiv.style("text-align", "center");

  let sendingText = createDiv("Thank you!");
  sendingText.parent(thankYouDiv);
  sendingText.style("font-size", "36px");
  sendingText.style("margin-bottom", "20px"); // Add some padding

  let thankYouText = createDiv("Sending...");
  thankYouText.parent(thankYouDiv);
  thankYouText.style("font-size", "18px"); // Half the size of the "Sending..." text
}

function removeThankYouMessage() {
  console.log("Attempting to remove Thank you message");
  let existingMessage = select("#thank-you-overlay");
  if (existingMessage) {
    existingMessage.remove();
  }
}

function keyPressed() {
  if (key.length === 1) {
    inputText += key;
  } else if (keyCode === BACKSPACE) {
    inputText = inputText.slice(0, -1);
  } else if (keyCode === RETURN || keyCode === ENTER) {
    sendMessage();
  }
}

function jsonp(url, data, callback) {
  let callbackName = "jsonp_callback_" + Math.round(100000 * Math.random());

  url += (url.indexOf("?") >= 0 ? "&" : "?") + "callback=" + callbackName;
  for (let key in data) {
    url += "&" + key + "=" + encodeURIComponent(data[key]);
  }

  let script = document.createElement("script");
  script.src = url;

  window[callbackName] = function (data) {
    callback(data);
    document.body.removeChild(script);
    delete window[callbackName];
  };

  document.body.appendChild(script);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
