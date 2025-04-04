let shapes = ['square', 'star', 'circle', 'heart'];
let currentShapeIndex = 0;
let currentShape = null;
let userTrace = [];
let isDrawing = false;
let score = 0;
let myFont;
let showInstructions = false;
let shapeSize;
let traceWidth = 3;
let shapePoints = [];
let samplePoints = 100;
let nextButton;
let shapeScores = [0, 0, 0, 0];
let showingFinalScore = false;

function preload() {
    console.log("Preloading font...");
    myFont = loadFont("../assets/Press_Start_2P/PressStart2P-Regular.ttf", 
        () => console.log("Font loaded successfully"),
        () => console.error("Failed to load font")
    );
}

function setup() {
    console.log("Setting up canvas...");
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');
    colorMode(RGB);
    background(0);
    
    // Initialize shape size after canvas is created
    shapeSize = Math.min(windowWidth, windowHeight) * 0.4;
    
    // Start with first shape
    loadNextShape();
    
    // Disable right-click context menu
    canvas.elt.oncontextmenu = (e) => e.preventDefault();
    
    console.log("Setup complete, current shape:", currentShape);
}

function draw() {
    background(0);
    
    if (showingFinalScore) {
        displayFinalScore();
        return;
    }
    
    // Draw the target shape first (in gray)
    push();
    translate(width/2, height/2);
    stroke(150); // Gray stroke
    strokeWeight(4); // Increased stroke weight for better visibility
    noFill();
    drawShape(currentShape);
    pop();
    
    // Draw user's trace on top
    if (userTrace.length > 1) {
        push();
        stroke(255, 105, 180); // Pink trace
        strokeWeight(traceWidth);
        noFill();
        beginShape();
        for (let point of userTrace) {
            vertex(point.x, point.y);
        }
        endShape();
        pop();
    }
    
    // Draw next button (white arrow)
    drawNextButton();
    
    // Update score display
    document.getElementById('score').textContent = `Score: ${score}`;
    
    // Draw progress indicator
    drawProgressIndicator();
}

function displayFinalScore() {
    // Calculate average score
    let totalScore = 0;
    for (let i = 0; i < shapeScores.length; i++) {
        console.log(`${shapes[i]} score: ${shapeScores[i]}`);
        totalScore += shapeScores[i];
    }
    let averageScore = Math.round(totalScore / shapeScores.length);
    console.log("Average score:", averageScore);
    
    push();
    textFont(myFont);
    textAlign(CENTER, CENTER);
    
    // Display large score
    textSize(80);
    fill(255);
    text("TOTAL SCORE", width/2, height/2 - 100);
    
    textSize(120);
    fill(255); // White color
    text(averageScore, width/2, height/2 + 50);
    
    // Display individual scores
    textSize(20);
    fill(255);
    let y = height/2 + 150;
    text(`SQUARE: ${shapeScores[0]}   STAR: ${shapeScores[1]}   CIRCLE: ${shapeScores[2]}   HEART: ${shapeScores[3]}`, 
         width/2, y);
    
    // Draw restart button
    textSize(24);
    text("CLICK ANYWHERE TO RESTART", width/2, height - 100);
    pop();
}

function drawNextButton() {
    // Don't draw button on final screen
    if (showingFinalScore) return;
    
    // Position in bottom center
    let buttonWidth = 200;
    let buttonHeight = 60;
    let buttonX = width/2;
    let buttonY = height - 80;
    
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

function drawProgressIndicator() {
    // Draw progress indicator at top of screen
    push();
    let totalShapes = shapes.length;
    let boxWidth = 30;
    let boxSpacing = 20;
    let totalWidth = totalShapes * boxWidth + (totalShapes - 1) * boxSpacing;
    let startX = width/2 - totalWidth/2;
    
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

function loadNextShape() {
    currentShape = shapes[currentShapeIndex];
    userTrace = [];
    score = 0;
    
    // Generate points for scoring
    shapePoints = generateShapePoints(currentShape);
    
    console.log(`Loaded shape: ${currentShape} (${currentShapeIndex + 1}/${shapes.length})`);
}

function goToNextShape() {
    // Calculate score if user is still drawing
    if (isDrawing) {
        isDrawing = false;
        score = calculateScore();
        console.log("Score calculated on next:", score);
    }
    
    // Save current score
    shapeScores[currentShapeIndex] = score;
    console.log(`Saved score ${score} for shape: ${shapes[currentShapeIndex]}`);
    
    // Check if we've reached the end
    if (currentShapeIndex === shapes.length - 1) {
        console.log("Final scores:", shapeScores);
        showingFinalScore = true;
        return;
    }
    
    // Otherwise move to next shape
    currentShapeIndex++;
    loadNextShape();
}

function generateShapePoints(shape) {
    let points = [];
    let centerX = width/2;
    let centerY = height/2;
    
    switch(shape) {
        case 'circle':
            for (let i = 0; i < samplePoints; i++) {
                let angle = (i / samplePoints) * TWO_PI;
                let x = centerX + cos(angle) * shapeSize/2;
                let y = centerY + sin(angle) * shapeSize/2;
                points.push(createVector(x, y));
            }
            break;
        case 'square':
            let side = shapeSize/2;
            for (let i = 0; i < samplePoints; i++) {
                let t = i / samplePoints;
                let x, y;
                if (t < 0.25) {
                    x = centerX - side + t * 4 * side;
                    y = centerY - side;
                } else if (t < 0.5) {
                    x = centerX + side;
                    y = centerY - side + (t - 0.25) * 4 * side;
                } else if (t < 0.75) {
                    x = centerX + side - (t - 0.5) * 4 * side;
                    y = centerY + side;
                } else {
                    x = centerX - side;
                    y = centerY + side - (t - 0.75) * 4 * side;
                }
                points.push(createVector(x, y));
            }
            break;
        case 'star':
            // Fix star point generation to match how the star is actually drawn
            let npoints = 5;
            let starAngle = TWO_PI / npoints;
            let halfStarAngle = starAngle / 2.0;
            let radius1 = shapeSize/2;
            let radius2 = shapeSize/4;
            
            // Generate points that match the actual star shape
            for (let i = 0; i < samplePoints; i++) {
                let t = i / samplePoints;
                let fullAngle = t * TWO_PI;
                let angleIndex = Math.floor(fullAngle / starAngle);
                let angleOffset = fullAngle - angleIndex * starAngle;
                
                let x, y;
                if (angleOffset < halfStarAngle) {
                    // Interpolate between outer point and inner point
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
                    // Interpolate between inner point and next outer point
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
            // Better heart point generation that matches the bezier curve
            // First half - right side of heart
            for (let i = 0; i < samplePoints/2; i++) {
                let t = i / (samplePoints/2);
                let size = shapeSize/2;
                
                // Bezier curve parameters matching the drawHeart function
                let x1 = centerX;
                let y1 = centerY + size/4;
                let cx1 = centerX + size/2;
                let cy1 = centerY - size/2;
                let cx2 = centerX + size;
                let cy2 = centerY + size/4;
                let x2 = centerX;
                let y2 = centerY + size;
                
                // Calculate point on bezier curve
                let x = bezierPoint(x1, cx1, cx2, x2, t);
                let y = bezierPoint(y1, cy1, cy2, y2, t);
                
                points.push(createVector(x, y));
            }
            
            // Second half - left side of heart
            for (let i = 0; i < samplePoints/2; i++) {
                let t = i / (samplePoints/2);
                let size = shapeSize/2;
                
                // Bezier curve parameters matching the drawHeart function
                let x1 = centerX;
                let y1 = centerY + size;
                let cx1 = centerX - size;
                let cy1 = centerY + size/4;
                let cx2 = centerX - size/2;
                let cy2 = centerY - size/2;
                let x2 = centerX;
                let y2 = centerY + size/4;
                
                // Calculate point on bezier curve
                let x = bezierPoint(x1, cx1, cx2, x2, t);
                let y = bezierPoint(y1, cy1, cy2, y2, t);
                
                points.push(createVector(x, y));
            }
            break;
    }
    
    return points;
}

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
            drawHeart(0, 0, shapeSize/2);
            break;
    }
}

function drawStar(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius2;
        let sy = y + sin(a) * radius2;
        vertex(sx, sy);
        sx = x + cos(a + halfAngle) * radius1;
        sy = y + sin(a + halfAngle) * radius1;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

function drawHeart(x, y, size) {
    beginShape();
    vertex(x, y + size/4);
    bezierVertex(
        x + size/2, y - size/2,
        x + size, y + size/4,
        x, y + size
    );
    bezierVertex(
        x - size, y + size/4,
        x - size/2, y - size/2,
        x, y + size/4
    );
    endShape(CLOSE);
}

function calculateScore() {
    if (userTrace.length < 2) {
        console.log("Not enough points in trace");
        return 0;
    }
    
    let totalDeviation = 0;
    let tracePoints = sampleTracePoints();
    console.log("Sampled trace points:", tracePoints.length);
    
    // For each point on the target shape
    for (let i = 0; i < samplePoints; i++) {
        let minDist = Infinity;
        // Find the closest point on the user's trace
        for (let tracePoint of tracePoints) {
            let dist = p5.Vector.dist(shapePoints[i], tracePoint);
            minDist = Math.min(minDist, dist);
        }
        totalDeviation += minDist;
    }
    
    // Convert deviation to score (lower deviation = higher score)
    let avgDeviation = totalDeviation / samplePoints;
    console.log("Average deviation:", avgDeviation);
    
    // Adjust the scoring formula to be more lenient and scale based on shape size
    let maxAllowedDeviation = shapeSize * 0.2; // Allow 20% of shape size as maximum deviation
    let normalizedDeviation = Math.min(avgDeviation / maxAllowedDeviation, 1);
    score = Math.max(0, Math.floor(100 * (1 - normalizedDeviation)));
    
    console.log("Final score:", score);
    return score;
}

function sampleTracePoints() {
    let points = [];
    // Sample more points for better accuracy
    let step = Math.max(1, Math.floor(userTrace.length / samplePoints));
    
    for (let i = 0; i < userTrace.length; i += step) {
        points.push(userTrace[i]);
    }
    
    // If we have fewer points than samplePoints, add the last point
    if (points.length < samplePoints && userTrace.length > 0) {
        points.push(userTrace[userTrace.length - 1]);
    }
    
    return points;
}

function mousePressed() {
    // Handle restart from final score screen
    if (showingFinalScore) {
        showingFinalScore = false;
        currentShapeIndex = 0;
        shapeScores = [0, 0, 0, 0];
        loadNextShape();
        return;
    }
    
    if (showInstructions) {
        showInstructions = false;
        return;
    }
    
    // Check if next button was clicked
    if (isNextButtonClicked(mouseX, mouseY)) {
        goToNextShape();
        return;
    }
    
    isDrawing = !isDrawing;
    if (!isDrawing) {
        console.log("Calculating score...");
        console.log("Trace points:", userTrace.length);
        score = calculateScore();
        console.log("Score:", score);
    } else {
        userTrace = [];
        score = 0;
    }
}

function isNextButtonClicked(x, y) {
    if (!nextButton) return false;
    
    // Rectangle hit detection
    return (
        x > nextButton.x - nextButton.width/2 &&
        x < nextButton.x + nextButton.width/2 &&
        y > nextButton.y - nextButton.height/2 &&
        y < nextButton.y + nextButton.height/2
    );
}

function mouseDragged() {
    if (isDrawing) {
        let point = createVector(mouseX, mouseY);
        userTrace.push(point);
    }
}

function keyPressed() {
    // No longer using space key
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    shapeSize = Math.min(windowWidth, windowHeight) * 0.4;
    if (currentShape) {
        shapePoints = generateShapePoints(currentShape);
    }
} 