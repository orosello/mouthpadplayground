// Contants
const SHAPES = ['square', 'star', 'circle', 'heart'];
const SHAPE_COLORS = {
  target: [150, 150, 150],    // Gray for target shape
  trace: [255, 105, 180]      // Pink for user's trace
};
const SAMPLE_POINTS = 100;    // Number of points to sample for scoring
const TRACE_WIDTH = 3;        // Width of the user's trace line

// Varaibles
let currentShapeIndex = 0;
let currentShape = null;
let userTrace = [];
let isDrawing = false;
let score = 0;
let myFont;
let shapeSize;
let shapePoints = [];
let nextButton;
let shapeScores = [0, 0, 0, 0];
let showingFinalScore = false;

// Preload assets
function preload() {
  console.log("Preloading font...");
  myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf", 
    () => console.log("Font loaded successfully"),
    () => console.error("Failed to load font")
  );
}

// Initialize the sketch
function setup() {
  console.log("Setting up canvas...");
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');
  colorMode(RGB);
  background(0);
  
  // Initialize shape size based on screen dimensions
  shapeSize = Math.min(windowWidth, windowHeight) * 0.4;
  
  // Start with first shape
  loadNextShape();
  
  // Disable right-click context menu
  canvas.elt.oncontextmenu = (e) => e.preventDefault();
  
  console.log("Setup complete, current shape:", currentShape);
}

// Main draw loop
function draw() {
  background(0);
  
  if (showingFinalScore) {
    displayFinalScore();
    return;
  }
  
  drawTargetShape();
  drawUserTrace();
  drawNextButton();
  
  // Update score display
  document.getElementById('score').textContent = `Score: ${score}`;
  
  drawProgressIndicator();
}

// Draw the target shape in the center
function drawTargetShape() {
  push();
  translate(width/2, height/2);
  stroke(SHAPE_COLORS.target);
  strokeWeight(4);
  noFill();
  drawShape(currentShape);
  pop();
}

// Draw the user's trace
function drawUserTrace() {
  if (userTrace.length > 1) {
    push();
    stroke(SHAPE_COLORS.trace);
    strokeWeight(TRACE_WIDTH);
    noFill();
    beginShape();
    for (let point of userTrace) {
      vertex(point.x, point.y);
    }
    endShape();
    pop();
  }
}

// Display final score screen
function displayFinalScore() {
  // Calculate average score
  let totalScore = 0;
  for (let i = 0; i < shapeScores.length; i++) {
    console.log(`${SHAPES[i]} score: ${shapeScores[i]}`);
    totalScore += shapeScores[i];
  }
  let averageScore = Math.round(totalScore / shapeScores.length);
  console.log("Average score:", averageScore);
  
  push();
  textFont(myFont);
  textAlign(CENTER, CENTER);
  
  // Use responsive text sizes based on screen dimensions
  const minDimension = Math.min(width, height);
  const titleSize = constrain(minDimension * 0.08, 20, 80);
  const scoreSize = constrain(minDimension * 0.12, 30, 120);
  const detailSize = constrain(minDimension * 0.02, 10, 20);
  const restartSize = constrain(minDimension * 0.025, 14, 24);
  
  // Calculate vertical spacing based on screen height
  const verticalSpacing = height * 0.1;
  const marginTop = height * 0.15;
  
  // Display title
  textSize(titleSize);
  fill(255);
  text("TOTAL SCORE", width/2, marginTop);
  
  // Display large score
  textSize(scoreSize);
  fill(255);
  text(averageScore, width/2, marginTop + verticalSpacing * 1.5);
  
  // Display individual scores
  textSize(detailSize);
  fill(255);
  
  // Check if all scores fit on one line
  const scoreText = `SQUARE: ${shapeScores[0]}   STAR: ${shapeScores[1]}   CIRCLE: ${shapeScores[2]}   HEART: ${shapeScores[3]}`;
  const scoreY = marginTop + verticalSpacing * 3;
  
  if (textWidth(scoreText) > width * 0.9) {
    // Split into two lines if too wide
    text(`SQUARE: ${shapeScores[0]}   STAR: ${shapeScores[1]}`, width/2, scoreY);
    text(`CIRCLE: ${shapeScores[2]}   HEART: ${shapeScores[3]}`, width/2, scoreY + detailSize * 1.5);
  } else {
    text(scoreText, width/2, scoreY);
  }
  
  // Draw restart button with safe margin from bottom
  textSize(restartSize);
  text("CLICK ANYWHERE TO RESTART", width/2, height - verticalSpacing);
  pop();
}

// Draw the next button
function drawNextButton() {
  // Don't draw button on final screen
  if (showingFinalScore) return;
  
  // Position in bottom center
  const buttonWidth = 200;
  const buttonHeight = 60;
  const buttonX = width/2;
  const buttonY = height - 80;
  
  push();
  // Draw rectangle button with thin outline
  stroke(255);
  strokeWeight(1);
  noFill();
  rectMode(CENTER);
  rect(buttonX, buttonY, buttonWidth, buttonHeight);
  
  // Add text without outline
  noStroke();
  fill(255);
  textFont(myFont);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("NEXT SHAPE", buttonX, buttonY);
  pop();
  
  // Store button position and size for click detection
  nextButton = {
    x: buttonX,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight
  };
}

// Draw the progress indicator showing which shape we're on
function drawProgressIndicator() {
  push();
  const totalShapes = SHAPES.length;
  const boxWidth = 30;
  const boxSpacing = 20;
  const totalWidth = totalShapes * boxWidth + (totalShapes - 1) * boxSpacing;
  const startX = width/2 - totalWidth/2;
  
  for (let i = 0; i < totalShapes; i++) {
    let x = startX + i * (boxWidth + boxSpacing);
    if (i === currentShapeIndex) {
      fill(255); // Current shape is white
    } else {
      noFill(); // Others are empty
    }
    stroke(255);
    rect(x, 80, boxWidth, boxWidth);
  }
  pop();
}

// Load the next shape and reset user trace
function loadNextShape() {
  currentShape = SHAPES[currentShapeIndex];
  userTrace = [];
  score = 0;
  
  // Generate points for scoring
  shapePoints = generateShapePoints(currentShape);
  
  console.log(`Loaded shape: ${currentShape} (${currentShapeIndex + 1}/${SHAPES.length})`);
}

// Advance to the next shape or show final score
function goToNextShape() {
  // Calculate score if user is still drawing
  if (isDrawing) {
    isDrawing = false;
    score = calculateScore();
    console.log("Score calculated on next:", score);
  }
  
  // Save current score
  shapeScores[currentShapeIndex] = score;
  console.log(`Saved score ${score} for shape: ${SHAPES[currentShapeIndex]}`);
  
  // Check if we've reached the end
  if (currentShapeIndex === SHAPES.length - 1) {
    console.log("Final scores:", shapeScores);
    showingFinalScore = true;
    return;
  }
  
  // Otherwise move to next shape
  currentShapeIndex++;
  loadNextShape();
}

// Generate sample points for the current shape to use in scoring
function generateShapePoints(shape) {
  let points = [];
  const centerX = width/2;
  const centerY = height/2;
  
  switch(shape) {
    case 'circle':
      for (let i = 0; i < SAMPLE_POINTS; i++) {
        let angle = (i / SAMPLE_POINTS) * TWO_PI;
        let x = centerX + cos(angle) * shapeSize/2;
        let y = centerY + sin(angle) * shapeSize/2;
        points.push(createVector(x, y));
      }
      break;
      
    case 'square':
      const side = shapeSize/2;
      for (let i = 0; i < SAMPLE_POINTS; i++) {
        let t = i / SAMPLE_POINTS;
        let x, y;
        
        if (t < 0.25) {
          // Top edge
          x = centerX - side + t * 4 * side;
          y = centerY - side;
        } else if (t < 0.5) {
          // Right edge
          x = centerX + side;
          y = centerY - side + (t - 0.25) * 4 * side;
        } else if (t < 0.75) {
          // Bottom edge
          x = centerX + side - (t - 0.5) * 4 * side;
          y = centerY + side;
        } else {
          // Left edge
          x = centerX - side;
          y = centerY + side - (t - 0.75) * 4 * side;
        }
        points.push(createVector(x, y));
      }
      break;
      
    case 'star':
      const npoints = 5;
      const starAngle = TWO_PI / npoints;
      const halfStarAngle = starAngle / 2.0;
      const radius1 = shapeSize/2;  // Outer radius
      const radius2 = shapeSize/4;  // Inner radius
      
      for (let i = 0; i < SAMPLE_POINTS; i++) {
        let t = i / SAMPLE_POINTS;
        let fullAngle = t * TWO_PI;
        let angleIndex = Math.floor(fullAngle / starAngle);
        let angleOffset = fullAngle - angleIndex * starAngle;
        
        let x, y;
        if (angleOffset < halfStarAngle) {
          // Interpolate between inner point and outer point
          let ratio = angleOffset / halfStarAngle;
          let angle1 = angleIndex * starAngle;
          let angle2 = angle1 + halfStarAngle;
          let x1 = centerX + cos(angle1) * radius2;
          let y1 = centerY + sin(angle1) * radius2;
          let x2 = centerX + cos(angle2) * radius1;
          let y2 = centerY + sin(angle2) * radius1;
          x = lerp(x1, x2, ratio);
          y = lerp(y1, y2, ratio);
        } else {
          // Interpolate between outer point and next inner point
          let ratio = (angleOffset - halfStarAngle) / halfStarAngle;
          let angle1 = angleIndex * starAngle + halfStarAngle;
          let angle2 = (angleIndex + 1) * starAngle;
          let x1 = centerX + cos(angle1) * radius1;
          let y1 = centerY + sin(angle1) * radius1;
          let x2 = centerX + cos(angle2) * radius2;
          let y2 = centerY + sin(angle2) * radius2;
          x = lerp(x1, x2, ratio);
          y = lerp(y1, y2, ratio);
        }
        
        points.push(createVector(x, y));
      }
      break;
      
    case 'heart':
      // Generate points for heart curve
      // First half - right side of heart
      for (let i = 0; i < SAMPLE_POINTS/2; i++) {
        let t = i / (SAMPLE_POINTS/2);
        let size = shapeSize;
        
        // Bezier curve parameters matching the drawHeart function
        let x1 = centerX;
        let y1 = centerY;
        let cx1 = centerX + size/2;
        let cy1 = centerY - size*0.75;
        let cx2 = centerX + size;
        let cy2 = centerY;
        let x2 = centerX;
        let y2 = centerY + size*0.75;
        
        // Calculate point on bezier curve
        let x = bezierPoint(x1, cx1, cx2, x2, t);
        let y = bezierPoint(y1, cy1, cy2, y2, t);
        
        points.push(createVector(x, y));
      }
      
      // Second half - left side of heart
      for (let i = 0; i < SAMPLE_POINTS/2; i++) {
        let t = i / (SAMPLE_POINTS/2);
        let size = shapeSize;
        
        // Bezier curve parameters matching the drawHeart function
        let x1 = centerX;
        let y1 = centerY + size*0.75;
        let cx1 = centerX - size;
        let cy1 = centerY;
        let cx2 = centerX - size/2;
        let cy2 = centerY - size*0.75;
        let x2 = centerX;
        let y2 = centerY;
        
        // Calculate point on bezier curve
        let x = bezierPoint(x1, cx1, cx2, x2, t);
        let y = bezierPoint(y1, cy1, cy2, y2, t);
        
        points.push(createVector(x, y));
      }
      break;
  }
  
  return points;
}

// Draw the specified shape at the center position
function drawShape(shape) {
  switch(shape) {
    case 'circle':
      circle(0, 0, shapeSize);
      break;
    case 'square':
      rectMode(CENTER);
      rect(0, 0, shapeSize, shapeSize);
      break;
    case 'star':
      drawStar(0, 0, shapeSize/2, shapeSize/4, 5);
      break;
    case 'heart':
      drawHeart(0, 0, shapeSize);
      break;
  }
}

// Draw a star shape
function drawStar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    // Inner point
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    
    // Outer point
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// Draw a heart shape
function drawHeart(x, y, size) {
  beginShape();
  vertex(x, y);
  // Right curve
  bezierVertex(
    x + size/2, y - size*0.75,
    x + size, y,
    x, y + size*0.75
  );
  // Left curve
  bezierVertex(
    x - size, y,
    x - size/2, y - size*0.75,
    x, y
  );
  endShape(CLOSE);
}

// Calculate score based on how well the user traced the shape
function calculateScore() {
  if (userTrace.length < 2) {
    console.log("Not enough points in trace");
    return 0;
  }
  
  let totalDeviation = 0;
  let tracePoints = sampleTracePoints();
  console.log("Sampled trace points:", tracePoints.length);
  
  // For each point on the target shape, find the closest user trace point
  for (let i = 0; i < SAMPLE_POINTS; i++) {
    let minDist = Infinity;
    for (let tracePoint of tracePoints) {
      let dist = p5.Vector.dist(shapePoints[i], tracePoint);
      minDist = Math.min(minDist, dist);
    }
    totalDeviation += minDist;
  }
  
  // Convert deviation to score (lower deviation = higher score)
  let avgDeviation = totalDeviation / SAMPLE_POINTS;
  console.log("Average deviation:", avgDeviation);
  
  // Adjust the scoring formula to be more lenient and scale based on shape size
  const maxAllowedDeviation = shapeSize * 0.2; // Allow 20% of shape size as maximum deviation
  let normalizedDeviation = Math.min(avgDeviation / maxAllowedDeviation, 1);
  score = Math.max(0, Math.floor(100 * (1 - normalizedDeviation)));
  
  console.log("Final score:", score);
  return score;
}

// Sample points from the user's trace to compare with target shape

function sampleTracePoints() {
  let points = [];
  // Sample more points for better accuracy
  let step = Math.max(1, Math.floor(userTrace.length / SAMPLE_POINTS));
  
  for (let i = 0; i < userTrace.length; i += step) {
    points.push(userTrace[i]);
  }
  
  // If we have fewer points than sample points, add the last point
  if (points.length < SAMPLE_POINTS && userTrace.length > 0) {
    points.push(userTrace[userTrace.length - 1]);
  }
  
  return points;
}

// EVENT HANDLERS

// Mous pressed event handler
function mousePressed() {
  // Handle restart from final score screen
  if (showingFinalScore) {
    showingFinalScore = false;
    currentShapeIndex = 0;
    shapeScores = [0, 0, 0, 0];
    loadNextShape();
    return;
  }
  
  // Check if next button was clicked
  if (isNextButtonClicked(mouseX, mouseY)) {
    goToNextShape();
    return;
  }
  
  // Toggle drawing mode
  isDrawing = !isDrawing;
  if (!isDrawing) {
    console.log("Calculating score...");
    score = calculateScore();
    console.log("Score:", score);
  } else {
    userTrace = [];
    score = 0;
  }
}

// Check if mouse is over the next button
function isNextButtonClicked(x, y) {
  if (!nextButton) return false;
  
  return (
    x > nextButton.x - nextButton.width/2 &&
    x < nextButton.x + nextButton.width/2 &&
    y > nextButton.y - nextButton.height/2 &&
    y < nextButton.y + nextButton.height/2
  );
}

// Handle mouse drag to add points to the trace
function mouseDragged() {
  if (isDrawing) {
    let point = createVector(mouseX, mouseY);
    userTrace.push(point);
  }
}

// window resized event handler
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  shapeSize = Math.min(windowWidth, windowHeight) * 0.4;
  if (currentShape) {
    shapePoints = generateShapePoints(currentShape);
  }
} 