let inputText = "";
let blink = true;
let lastBlinkTime = 0;
let customFont;
let keyWidth = 40;
let keyHeight = 40;
let totalKeysPerRow = 10;
let extraKeys = [" ", "<"];
let sendButton;
const googleScriptURL =
  "https://script.google.com/macros/s/AKfycbzTJNZEfGtoMpLNPh1rPPl8a4nxNmhr2_EI3QIU9cpN3jHtbEDbN1Rt2WpnBaAStyGm/exec"; // Replace with your actual URL

function preload() {
  customFont = loadFont("../assets/led-counter-7/led_counter-7.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(customFont);
  textSize(32);

  sendButton = createButton("Send");
  sendButton.position(width / 2 - 20, height / 2 + 200);
  sendButton.mousePressed(sendMessage);
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

  if (millis() - lastBlinkTime > 500) {
    blink = !blink;
    lastBlinkTime = millis();
  }

  drawKeyboard();
}

function drawKeyboard() {
  let keys = "QWERTYUIOPASDFGHJKLZXCVBNM";
  let startX = width / 2 - (totalKeysPerRow * keyWidth) / 2;
  let startY = height / 2 + 50;

  for (let i = 0; i < keys.length; i++) {
    let x = startX + (i % totalKeysPerRow) * keyWidth;
    let y = startY + Math.floor(i / totalKeysPerRow) * keyHeight;
    noFill();
    stroke(255);
    rect(x, y, keyWidth, keyHeight, 5);
    fill(128);
    noStroke();
    text(
      keys[i],
      x + keyWidth / 2 - textWidth(keys[i]) / 2,
      y + keyHeight / 2 + 10
    );
  }

  let extraX = startX + (keys.length % totalKeysPerRow) * keyWidth;
  let extraY = startY + Math.floor(keys.length / totalKeysPerRow) * keyHeight;

  for (let i = 0; i < extraKeys.length; i++) {
    noFill();
    stroke(255);
    rect(extraX, extraY, keyWidth, keyHeight, 5);
    fill(128);
    noStroke();
    text(
      extraKeys[i],
      extraX + keyWidth / 2 - textWidth(extraKeys[i]) / 2,
      extraY + keyHeight / 2 + 10
    );
    extraX += keyWidth;
  }
}

function mousePressed() {
  let startX = width / 2 - (totalKeysPerRow * keyWidth) / 2;
  let startY = height / 2 + 50;
  let keys = "QWERTYUIOPASDFGHJKLZXCVBNM" + extraKeys.join("");

  for (let i = 0; i < keys.length; i++) {
    let x = startX + (i % totalKeysPerRow) * keyWidth;
    let y = startY + Math.floor(i / totalKeysPerRow) * keyHeight;
    if (
      mouseX > x &&
      mouseX < x + keyWidth &&
      mouseY > y &&
      mouseY < y + keyHeight
    ) {
      if (i < keys.length - extraKeys.length) {
        inputText += keys[i];
      } else if (keys[i] === "<") {
        inputText = inputText.slice(0, -1);
      } else {
        inputText += " ";
      }
      break;
    }
  }
}

function sendMessage() {
  if (inputText.trim() === "") return;

  let message = inputText;
  let metrics = JSON.parse(localStorage.getItem("benchmarkMetrics"));

  let data = {
    name: message,
    ...metrics,
  };

  jsonp(googleScriptURL, data, function (response) {
    console.log("Response:", response);
    if (response.result === "success") {
      console.log("Message and metrics sent successfully!");
      localStorage.removeItem("benchmarkMetrics"); // Clear the stored metrics
    } else {
      console.error("Error sending message and metrics.");
    }
  });

  inputText = ""; // Clear the input text
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
