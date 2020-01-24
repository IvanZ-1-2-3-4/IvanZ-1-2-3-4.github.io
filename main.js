//#region vars
// ---------------INIT STATE-------------------------
const initVelX = 15,//50/(Math.sqrt(50*9.81)/9.81)/2,
    initVelY = 0,//Math.sqrt(50*9.81),
    initPosX = 0,
    initPosY = 15;
// --------------------------------------------------


// ---------------CANVAS VARIABLES-------------------
// All lengths are in meters, all speeds are in m/s
const canvasArea = 1000 * 500,
    canvasMargin = 8;
let canvasWidthReal = 50,
    canvasHeightReal = 25,
    canvasWidth = Math.sqrt(canvasArea * canvasWidthReal / canvasHeightReal),
    canvasHeight = Math.sqrt(canvasArea * canvasHeightReal / canvasWidthReal);
// --------------------------------------------------


// ---------------BALL OBJECT------------------------
function Ball(color, id) {
    this.id = id;
    // Real position of the ball in meters
    this.posRealX = initPosX;
    this.posRealY = initPosY;
    // Real velocity of the ball in meters per second
    this.velX = initVelX;
    this.velY = initVelY;
    // Starting position at beginning of animation
    this.startPosX = initPosX;
    this.startPosY = initPosY;
    // Starting velocity at beginning of animation
    this.startVelX = initVelX;
    this.startVelY = initVelY;
    this.radius = 10;
    // Numerical representation of color as integer between 0 and 16^6 - 1
    this.numColor = color;
    this.show = true;
    // If the ball is on the ground
    this.landed = false;
    Object.defineProperties(this, {
        "posX": {
            "get": function() {
                return (this.posRealX * canvasWidth / canvasWidthReal) + this.radius;
            }
        },
        "posY": {
            "get": function() {
                return (canvasHeight - (this.posRealY * canvasHeight / canvasHeightReal)) - this.radius;
            }
        },
        "speed": {
            "get": function() {
                return Math.sqrt(Math.pow(this.velX, 2) + Math.pow(this.velY, 2)); // c=√a²+b²
            }
        },
        "angle": {
            "get": function() {
                return atan(this.velX, this.velY); // θ=arctan(Vy/Vx)
            }
        },
        "color": {
            "get": function() {
                // Convert decimal number to html color value
                let out = this.numColor.toString(16);
                while (out.length < 6) {
                    // Prepend required number of zeroes to value if it isn't 6 digits long
                    out = "0" + out;
                }
                return "#" + out;
            }
        }
    });
    this.draw = function() {
        const trailLayer = document.getElementById("trail-layer-" + this.id);
        const trailContext = trailLayer.getContext("2d");
        const ballLayer = document.getElementById("layer" + this.id);
        const ballContext = ballLayer.getContext("2d");

        // Cover previous frame
        ballContext.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw new frame
        ballContext.beginPath();
        ballContext.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI);
        ballContext.fillStyle = this.color;
        ballContext.fill();

        // Draw velocity vectors
        if (document.getElementById("vectors").checked == true) {
            // Scale factor for arrow
            const scale = 5;
            // x-velocity vector
            arrow(this.posX, this.posY, this.posX + (this.velX * scale), this.posY, ballContext, this.color);
            // y-velocity vector
            arrow(this.posX, this.posY, this.posX, this.posY - (this.velY * scale), ballContext, this.color);
            // net velocity vector
            arrow(this.posX, this.posY, this.posX + Math.cos(rad(this.angle))*this.speed*scale, this.posY - Math.sin(rad(this.angle))*this.speed*scale, ballContext, this.color);
        }

        // Draw trail
        if (document.getElementById("trail").checked == true) {
            // Ensures no trail is drawn when ball is manually dragged
            if (isRunning == true) {
                trailContext.fillStyle = this.color;
                trailContext.fillRect(this.posX, this.posY, 2, 2);
            }
        }
    };
}
// --------------------------------------------------


// -----------ANIMATION UTILITY VARIABLES------------
// Time at the start of an animation
let startTime = null,
    // Is animation running
    isRunning = false,
    // Is data for graph being collected
    graphExists = true,
    // Graph axes
    graphX = "x",
    graphY = "y",
    // Timer time
    timerTime = 0,
    // Starting time value at start of animation
    startTimerTime = 0,
    // Stores ball objects
    balls = [],
    // ID of currently used ball
    currentBallID = 0;
    // Get index in array of ball with the selected id
    currentBallIndex = function() {
        let out;
        // Used to prevent errors as balls are not initialised prior to the function being called
        try {
            for (let i = 0; i <= balls.length; i++) {
                if (balls[i].id == currentBallID) {
                    out = i;
                }
            }
        } catch(err) {}
        finally {
            return out;
        }
    };
    // Graph data
    function Graph(graphX, graphY) {
        this.type = "scatter";
        this.data = {
            datasets: [{
                label: graphY + " against " + graphX,
                data: [],
                pointBackgroundColor: "rgba(0,0,0,1)"
            }]
        };
        this.options = {
            hover: {
                animationDuration: 0
            },
            responsive:true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: graphY
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: graphX
                    }
                }]
            }
        };
    }
    // Initial graph
    //let graphData = new Graph(graphX, graphY);
    // Create first ball
    balls[0] = new Ball(0, 0);
// Gravity
const g = -9.81;
// --------------------------------------------------


// ------------------HTML ELEMENTS-------------------
// Ball stats display
let posXDisplay,
    posYDisplay,
    speedDisplay,
    angleDisplay,
    velXDisplay,
    velYDisplay,
    timeDisplay,
    // Canvas width display
    canvasWidthDisplay,
    canvasHeightDisplay,
    //Checkboxes
    timerInput,
    // Slider inputs
    angleSlider;
// --------------------------------------------------
//#endregion

$(document).ready(function() {
    // Load all HTML elements once document is ready 
    posXDisplay = document.getElementById("posx");
    posYDisplay = document.getElementById("posy");
    speedDisplay = document.getElementById("speed");
    angleDisplay = document.getElementById("angle");
    velXDisplay = document.getElementById("velx");
    velYDisplay = document.getElementById("vely");
    timeDisplay = document.getElementById("time");
    canvasWidthDisplay = document.getElementById("width");
    canvasHeightDisplay = document.getElementById("height");
    timerInput = document.getElementById("timer");
    angleSlider = document.getElementById("angle-slider");

    // Set slider handler functions
    angleSlider.oninput = angleSliderInput;
    // Draw ball at initial position
    balls[0].draw();
    // Draw grid
    drawGrid();
    // Print out initial data
    printData(0);
    // Draw empty graph
    //drawGraph();
});

window.onload = function() {
    document.body.addEventListener("mousedown", drag);
};


// -----------------------------------MAIN ANIMATION FUNCTION------------------------------------------
function animate(timestamp) {
    // If animation is not running, starTime will be set to null
    if (!startTime) {
        // Set start time
        startTime = timestamp;
    }
    // Set time
    const time = (timestamp - startTime) * 0.001;
    for (let i = 0; i <= balls.length - 1; i++) {
        // Time at which the balls is supposed to hit the ground
        const impactTime = (-balls[i].startVelY - Math.sqrt(Math.pow(balls[i].startVelY, 2) - 2*g*balls[i].startPosY)) / g;
        
        // If ball is set to travel away from ground, it is no longer landed
        if (balls[i].landed && (impactTime != 0)) {
            balls[i].landed = false;
        }

        if (!balls[i].landed) {
            // Check if time > time at which ball is supposed to hit the ground
            if (time > impactTime) {
                balls[i].posRealY = 0;
                balls[i].landed = true;
                isRunning = false;
                impact = true;
                // Set timer time to time of impact
                if (timerInput.checked == true) {
                    timerTime = startTimerTime + impactTime;
                    window.alert("ball " + i + " has reached the ground at time " + sigfigs(timerTime, 4));
                }
            } else {
                // Update balls's position
                balls[i].posRealY = balls[i].startPosY + (balls[i].startVelY*time) + (0.5*g*Math.pow(time, 2)); // s=ut+1/2at²
                balls[i].posRealX = balls[i].startPosX + (balls[i].startVelX*time); // s=vt

                // Update balls's velocity
                balls[i].velX = balls[i].startVelX;
                balls[i].velY = balls[i].startVelY + g*time;

                // Increment timer time
                if (timerInput.checked == true) {
                    timerTime = startTimerTime + time;
                }
            }

            // Collect data for graph
            //collectGraphData(timerTime);
        }
    }
    // Draw balls
    drawAll();
    // Output ball stats
    printData(timerTime);

    // Continue or suspend the animation
    if (isRunning == true) {
        requestAnimationFrame(animate);
    } else {
        // Reset start time
        startTime = null;
        // Set starting timer time to time of pause
        startTimerTime = timerTime;
        // Set new start velocity and position
        setAll("startVelX", "velX", true);
        setAll("startVelY", "velY", true);
        setAll("startPosX", "posRealX", true);
        setAll("startPosY", "posRealY", true);
    }

    // Pause the animation
    $("#pause").click(function() {
        isRunning = false;
    });
}
// ----------------------------------------------------------------------------------------------------


//#region ----------------------------BUTTON CLICK HANDLERS AND OTHER FUNCTIONS-------------------------------
function startClick() {
    // Start animation
    isRunning = true;
    requestAnimationFrame(function(timestamp) {
        animate(timestamp);
    });
}

function newBall() {
    // Only allow changes if simulation is paused
    if (!isRunning) {
                // Index of new ball in the array
        // Find maximum id of balls and add 1
        let newBallID = 0;
        for (let i = 0; i <= balls.length - 1; i++) {
            if (balls[i].id > newBallID) {
                newBallID = balls[i].id;
            }
        }
        newBallID++;

        // Allow a maximum of 10 balls
        if (balls.length == 10) {
            window.alert("Maximum number of balls reached!");
        } else {
            // Create new ball
            balls.push(new Ball(randomColor(), newBallID));

            // Add a button
            $("#ball-selector").append(
                "<button id=\"ball-selector-" + newBallID + "\" style=\"display: inline-block; background-color: " + balls[balls.length - 1].color + "\" onclick=\"ballSelect(" + newBallID + ")\">&nbsp</button>"
            );

            // Add a canvas for trail
            $("#canvas-container").append(
                "<canvas id=\"trail-layer-" + newBallID + "\" class=\"b\" style=\"position: absolute; left: 8; top: 8; z-index: " + (newBallID * 2) + ";\" width=\"1000px\" height=\"500px\"></canvas>"
            );
            // Add a canvas for ball
            $("#canvas-container").append(
                "<canvas id=\"layer" + newBallID + "\" class=\"b\" style=\"position: absolute; left: 8; top: 8; z-index: " + (newBallID * 2 + 1) + ";\" width=\"1000px\" height=\"500px\"></canvas>"
            );
        
            // Draw new ball
            drawAll();

            // Set current ball ID
            if (balls.length == 1) {
                currentBallID = balls[0].id;
            }
        }    
    }
}

// Delete current ball
function deleteBall() {
    // Only allow changes if simulation is paused
    if (!isRunning) {
        console.log(currentBallIndex())
        for (let i = currentBallIndex(); i <= balls.length - 2; i++) {
            // Replace each ball with next one, shifting them down by one
            balls[i] = balls[i + 1];
        }
        // Remove redundant element at the end of array
        balls.pop();
        // Delete canvas
        $("#trail-layer-" + currentBallID).remove();
        $("#layer" + currentBallID).remove();
        // Delete button
        $("#ball-selector-" + currentBallID).remove();
        // Draw without ball
        drawAll();
        // Change to next ball
        if (balls.length !== 0) {
            currentBallID = balls[0].id;
        }
    }
}

// Reset state of simulation to default state
function reset() {
    // Reset all animation variables
    isRunning = false;
    startTime = null;
    setAll("startVelX", initVelX);
    setAll("startVelY", initVelY);
    setAll("startPosX", initPosX);
    setAll("startPosY", initPosY);
    // Reset ball position
    setAll("posRealX", initPosX);
    setAll("posRealY", initPosY);
    // Reset ball velocity
    setAll("velX", initVelX);
    setAll("velY", initVelY);
    resetTimer();
    clearTrail();
    // Draw ball at new position
    drawAll();
    // Print out new data
    printData(0);
}

function clearTrail() {
    for (let i = 0; i <= balls.length - 1; i++) {
        const canvas = document.getElementById("trail-layer-" + balls[i].id);
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvasWidth, canvasHeight);
    }
}

function resetTimer() {
    // Only allow changes when simulation is paused
    if (isRunning == false) {
        timerTime = 0;
        startTimerTime = 0;
        printData(0);
    }
}

function drawGrid() {
    const canvas = document.getElementById("grid-layer");
    const context = canvas.getContext("2d");
    const gridColor = "#999999";

    // Clear old grid
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid
    // Draw horizontal lines
    for (let i = 0; i <= canvasHeightReal; i++) {
        const pos = canvasHeight - (balls[0].radius + (i * canvasHeight / canvasHeightReal));
        line(0, pos, canvasWidth, pos, context, gridColor);
    }
    // Draw vertical lines
    for (let i = 0; i <= canvasWidthReal; i++) {
        const pos =  balls[0].radius + (i * canvasWidth / canvasWidthReal);
        line(pos, 0, pos, canvasHeight, context, gridColor);
    }
}

// Change dimensions of canvas
function setDim() {
    // Only allow changes when simulation is paused
    if (isRunning == false) {
        // Get input width and height
        let widthIn = document.getElementById("width").value;
        let heightIn = document.getElementById("height").value;
        if (validateFloat([widthIn, heightIn])) {
            canvasWidthReal = parseFloat(widthIn);
            canvasHeightReal = parseFloat(heightIn);

            // Convert real width and height to pixel values
            canvasWidth = Math.sqrt(canvasArea * canvasWidthReal / canvasHeightReal);
            canvasHeight = Math.sqrt(canvasArea * canvasHeightReal / canvasWidthReal);

            // Set canvas attributes to updated values
            $("#trail-layer").attr("width", canvasWidth);
            $("#trail-layer").attr("height", canvasHeight);
            $("#layer1").attr("width", canvasWidth);
            $("#layer1").attr("height", canvasHeight);  
            $("#grid-layer").attr("width", canvasWidth);
            $("#grid-layer").attr("height", canvasHeight);
            $("#base-layer").attr("width", canvasWidth);
            $("#base-layer").attr("height", canvasHeight);   

            // Draw ball at new position
            drawAll();
            // Draw new grid
            drawGrid();
            // Print out new data
            printData(null);   
        }
    }
}

// Set initial position
function setPos() {
    // Only allow changes when simulation is paused
    if (isRunning == false) {
        const xIn = posXDisplay.value;
        const yIn = posYDisplay.value;
        if (validateFloat([xIn, yIn])) {
            balls[currentBallIndex()].posRealX = parseFloat(xIn);
            balls[currentBallIndex()].posRealY = parseFloat(yIn);
            balls[currentBallIndex()].startPosX = parseFloat(xIn);
            balls[currentBallIndex()].startPosY = parseFloat(yIn);

            // Draw ball at new position
            balls[currentBallIndex()].draw();
            // Print out new data
            printData(null);
        }
    }
}

// Set initial rectangular velocity
function setVelRect() {
    // Only allow changes when simulation is paused
    if (isRunning == false) {
        const xIn = velXDisplay.value;
        const yIn = velYDisplay.value;
        if (validateFloat([xIn, yIn])) {
            balls[currentBallIndex()].startVelX = parseFloat(xIn);
            balls[currentBallIndex()].startVelY = parseFloat(yIn);
            balls[currentBallIndex()].velX = parseFloat(xIn);
            balls[currentBallIndex()].velY = parseFloat(yIn);

            // Draw ball at new position
            balls[currentBallIndex()].draw();
            // Print out new data
            printData(null);
        }
    }
}

// Set initial polar velocity
function setVelPolar() {
    // Only allow changes when simulation is paused
    if (isRunning == false) {
        const speedIn = speedDisplay.value;
        const angleIn = angleDisplay.value;
        if (validateFloat([speedIn]) && validateAngle([angleIn])) {
            balls[currentBallIndex()].startVelX = Math.cos(rad(angleIn)) * speedIn;
            balls[currentBallIndex()].startVelY = Math.sin(rad(angleIn)) * speedIn;
            balls[currentBallIndex()].velX = balls[currentBallIndex()].startVelX;
            balls[currentBallIndex()].velY = balls[currentBallIndex()].startVelY;

            // Draw ball at new position
            balls[currentBallIndex()].draw();
            // Print out new data
            printData(null);
        }
    }
}

// Output all ball data
function printData(time, slider = "") {
    posXDisplay.value = sigfigs(balls[currentBallIndex()].posRealX, 4);
    posYDisplay.value = sigfigs(balls[currentBallIndex()].posRealY, 4);
    velXDisplay.value = sigfigs(balls[currentBallIndex()].velX, 4);
    velYDisplay.value = sigfigs(balls[currentBallIndex()].velY, 4);
    speedDisplay.value = sigfigs(balls[currentBallIndex()].speed, 4);
    angleDisplay.value = sigfigs(balls[currentBallIndex()].angle, 4);
    angleSlider.value = sigfigs(balls[currentBallIndex()].angle, 4);
    // If no time update is needed, the parameter is passed as null
    if (time !== null) {
        timeDisplay.innerHTML = sigfigs(time, 4) + "s";
    }
}

// Change angle value
function angleSliderInput() {
    angleDisplay.value = this.value;
    setVelPolar();
}

// Hide or show vectors once checkbox is clicked
function showVectors() {
    // Only allow changes when simulation is paused
    if (isRunning == false) {
        balls[currentBallIndex()].draw();
    }
}
//#endregion ----------------------------------------------------------------------------------------------------


//#region ---------------------------------------GRAPHS-------------------------------------------------------
// Start graph data collection
function startGraph() {
    // Ensures graph axes cannot be changed during animation
    graphX = document.getElementById("x-axis").value;
    graphY = document.getElementById("y-axis").value;
    graphExists = true;
    graphData = new Graph(graphX, graphY);
    graphData.data.datasets[0].data = [];
}

// Collect graph data
function collectGraphData(time) {
    // New data point to be appended to graph
    let newDataPoint = {
        x: null,
        y: null
    };

    switch (graphX) {
        case "time":
            newDataPoint.x = time;
            break;
        case "x-position":
            newDataPoint.x = balls[0].posRealX;
            break;
        case "y-position":
            newDataPoint.x = balls[0].posRealY;
            break;
        case "x-velocity":
            newDataPoint.x = balls[0].velX;
            break;
        case "y-velocity":
            newDataPoint.x = balls[0].velY;
            break;
        case "speed":
            newDataPoint.x = balls[0].speed;
            break;
        case "angle":
            newDataPoint.x = balls[0].angle;
            break;
    }
    
    switch (graphY) {
        case "time":
            newDataPoint.y = time;
            break;
        case "x-position":
            newDataPoint.y = balls[0].posRealX;
            break;
        case "y-position":
            newDataPoint.y = balls[0].posRealY;
            break;
        case "x-velocity":
            newDataPoint.y = balls[0].velX;
            break;
        case "y-velocity":
            newDataPoint.y = balls[0].velY;
            break;
        case "speed":
            newDataPoint.y = balls[0].speed;
            break;
        case "angle":
            newDataPoint.y = balls[0].angle;
            break;
    }

    // Add new data point to data array
    graphData.data.datasets[0].data.push(newDataPoint);
}

// Draw graph
function drawGraph() {
    const context = document.getElementById("chart");
    let chart = new Chart(context, graphData);
}

// Delete graph
function resetGraph() {
    document.getElementById("graph-container").innerHTML = "";
    document.getElementById("graph-container").innerHTML = "<canvas id=\"chart\" class=\"chart\"></canvas>";
    graphData = null;
}
//#endregion ----------------------------------------------------------------------------------------------------


//#region -----------------------------------DRAG AND DROP BALL-----------------------------------------------
function drag(event) {
    // Only allow dragging if simulation is paused
    if (isRunning == false) {
        const canvas = document.getElementById("layer" + currentBallID);
        if ((event.clientX < (balls[0].posX + balls[0].radius + canvasMargin)) && (event.clientX > (balls[0].posX - balls[0].radius + canvasMargin))) {
            if ((event.clientY < (balls[0].posY + balls[0].radius + canvasMargin)) && (event.clientY > (balls[0].posY - balls[0].radius + canvasMargin))) {
                // Save old radius of the ball
                let oldRadius = balls[currentBallIndex()].radius;
                // Make ball bigger when dragged
                balls[currentBallIndex()].radius = oldRadius + (oldRadius / 4);
                canvas.addEventListener("mousemove", mousemove);
                canvas.addEventListener("mouseup", function(event) {
                    mouseup(event, oldRadius);
                });
            }
        }
    }
}

function mousemove(event) {
    // Convert mouse position to real ball position
    const newX = (event.clientX - balls[0].radius - canvasMargin) * canvasWidthReal / canvasWidth;
    const newY = (canvasHeight - (event.clientY + balls[0].radius - canvasMargin)) * canvasHeightReal / canvasHeight;
    balls[0].posRealX = newX;
    balls[0].posRealY = newY;
    startPosX = newX;
    startPosY = newY;
    balls[0].draw();
    printData(null);
}

function mouseup(event, oldRadius) {
    const canvas = document.getElementById("layer" + currentBallID);
    canvas.removeEventListener("mousemove", mousemove);
    canvas.removeEventListener("mouseUp", mouseup);
    // Reset ball to old radius
    balls[currentBallIndex()].radius = oldRadius;
    balls[currentBallIndex()].draw();
}
//#endregion ----------------------------------------------------------------------------------------------------


//#region -----------------------------------UTILITY FUNCTIONS------------------------------------------------
// Convert from degrees to radians
function rad(arg) {
    return arg / 180 * Math.PI;
}

// Convert from radians to degrees
function deg(arg) {
    return arg / Math.PI * 180;
}

// Altered arctan
function atan(x, y) {
    if (x < 0) {
        if (y < 0) {
            return -180 + deg(Math.atan(y / x));
        } else {
            return 180 + deg(Math.atan(y / x));
        }
    } else {
        return deg(Math.atan(y / x));
    }
}

// Truncate to 4 significant figures
function sigfigs(val, figs) {
    return String(val).substring(0, figs + 1);
}

// Used when input is a decimal
function validateFloat(inputs) {
    let out = true;
    for (let i = 0; i < inputs.length; i++) {
        if (isNaN(inputs[i])) {
            out = false;
        }
    }
    if (!out) {
        window.alert("Inputs needs to be numbers!");
    }
    return out;
}

// Used when input is an angle
function validateAngle(input) {
    if (validateFloat(input)) {
        if (Math.abs(input) > 180) {
            window.alert("Angle input must be between -180° and 180°.");
            return false;
        } else {
            return true;
        }
    }
}

// Draw line from (x1, y1) to (x2, y2)
function line(x1, y1, x2, y2, context, color = "black") {
    context.beginPath();
    context.strokeStyle = color;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

// Draw arrow from (x1, y1) to (x2, y2)
function arrow(x1, y1, x2, y2, context, color) {
    context.beginPath();
    const headLength = 10;
    const headAngle = 30;
    const angle = deg(Math.atan2(y2 - y1, x2 - x1));
    context.strokeStyle = color;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    // Rotate headAngle degrees, draw line with length headLength
    context.lineTo(x2 - headLength * Math.cos(rad(angle - headAngle)), y2 - headLength * Math.sin(rad(angle - headAngle)));
    context.moveTo(x2, y2);
    // Rotate headAngle degrees the other way, draw line with length headLength
    context.lineTo(x2 - headLength * Math.cos(rad(angle + headAngle)), y2 - headLength * Math.sin(rad(angle + headAngle)));        
    context.stroke();
}

// Draw all balls
function drawAll() {
    for (let i = 0; i <= balls.length - 1; i++) {
        balls[i].draw();
    }
}

// Set property value for all balls
function setAll(prop, val, dependent = false /* If the value assigned is a property of the object itself */) {
    if (dependent) {
        // If the value to be assigned is stored in a property of the ball
        for (let i = 0; i <= balls.length - 1; i++) {
            balls[i][prop] = balls[i][val];
        }
    } else {
        // If the value to be assigned is explicitly given
        for (let i = 0; i <= balls.length - 1; i++) {
            balls[i][prop] = val;
        }
    }
}

// Give random color which is sufficiently different from current ball colors
function randomColor() {
    // How far the colors must be apart from each other
    const similarityThreshold = 100000;
    // If appropriate color has been found
    let done = true;
    // New random color as integer between 0 and 16^4 - 1
    let color = Math.floor(Math.random() * (Math.pow(16, 6) - 1));

    // Check if any ball's color is similar to selected color
    for (let i = 0; i <= balls.length - 1; i++) {
        if (Math.abs(color - balls[i].numColor) < similarityThreshold) {
            done = false;
        }
    }

    if (done) {
        return color;
    } else {
        return randomColor();
    }
}
//#endregion ----------------------------------------------------------------------------------------------------


//#region -----------------------------------BALL CHANGE HANDLERS---------------------------------------------
// Select new ball ID
function ballSelect(selectedID) {
    currentBallID = selectedID;
    allOffOneOn(selectedID);
}

// Highlight selected button
function allOffOneOn(on) {
    for (let i = 0; i <= balls.length - 1; i++) {
        document.getElementById("ball-selector-" + balls[i].id).style.borderColor = null;
    }
    document.getElementById("ball-selector-" + on).style.borderColor = "green";
    printData();
}
//#endregion ----------------------------------------------------------------------------------------------------