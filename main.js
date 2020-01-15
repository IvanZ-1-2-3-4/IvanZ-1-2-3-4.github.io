//#region vars
// ---------------INIT STATE-------------------------
const initVelX = 50/(Math.sqrt(50*9.81)/9.81)/2,
    initVelY = Math.sqrt(50*9.81),
    initPosX = 0,
    initPosY = 0;
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
    // Starting velocity
    startVelX = initVelX,
    startVelY = initVelY,
    // Starting position
    startPosX = initPosX,
    startPosY = initPosY,
    // Timer time
    timerTime = 0,
    // Starting time value at start of animation
    startTimerTime = 0,
    balls = [],
    currentBallIndex = 0;
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
    let graphData = new Graph(graphX, graphY);
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

function Ball(color) {
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
    this.color = color;
    this.show = true;
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
        }
    });
    this.draw = function() {
        const layer1 = document.getElementById("layer1");
        const context1 = layer1.getContext("2d");
        const layer2 = document.getElementById("layer2");
        const context2 = layer2.getContext("2d");

        // Cover previous frame
        context2.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw new frame
        context2.beginPath();
        context2.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI);
        context2.fillStyle = this.color;
        context2.fill();

        // Draw velocity vectors
        if (document.getElementById("vectors").checked == true) {
            // Scale factor for arrow
            const scale = 5;
            // x-velocity vector
            arrow(this.posX, this.posY, this.posX + (this.velX * scale), this.posY, context2);
            // y-velocity vector
            arrow(this.posX, this.posY, this.posX, this.posY - (this.velY * scale), context2);
            // net velocity vector
            arrow(this.posX, this.posY, this.posX + Math.cos(rad(this.angle))*this.speed*scale, this.posY - Math.sin(rad(this.angle))*this.speed*scale, context2);
        }
    };
}
// Create first ball
balls[0] = new Ball("black");
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
    drawGraph();
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
        // If balls has made impact with ground
        let impact = false; // THIS IS REDUNDANT

        // Time at which the balls is supposed to hit the ground
        const impactTime = (-balls[i].startVelY - Math.sqrt(Math.pow(balls[i].startVelY, 2) - 2*g*balls[i].startPosY)) / g;

        // Check if time > time at which balls[0] is supposed to hit the ground
        if (time > impactTime) {
            balls[i].posRealY = 0;
            isRunning = false;
            impact = true;
            // Set timer time to time of impact
            if (timerInput.checked == true) {
                timerTime = startTimerTime + impactTime;
                window.alert("balls[0] has reached the ground at time " + sigfigs(timerTime, 4));
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

        // Draw ball
        balls[i].draw();
        // Output ball stats
        printData(timerTime);
        // Collect data for graph
        collectGraphData(timerTime);
    }

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


//#region -----------------------------------DRAG AND DROP BALL-----------------------------------------------
function drag(event) {
    if (isRunning == false) {
        const canvas = document.getElementById("layer2");
        if ((event.clientX < (balls[0].posX + balls[0].radius + canvasMargin)) && (event.clientX > (balls[0].posX - balls[0].radius + canvasMargin))) {
            if ((event.clientY < (balls[0].posY + balls[0].radius + canvasMargin)) && (event.clientY > (balls[0].posY - balls[0].radius + canvasMargin))) {
                canvas.addEventListener("mousemove", mousemove);
                canvas.addEventListener("mouseup", mouseup);
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

function mouseup(event) {
    const canvas = document.getElementById("layer2");
    canvas.removeEventListener("mousemove", mousemove);
    canvas.removeEventListener("mouseUp", mouseup);
}
//#endregion ----------------------------------------------------------------------------------------------------


//#region ----------------------------BUTTON CLICK HANDLERS AND OTHER FUNCTIONS-------------------------------
function startClick() {
    // Start animation
    isRunning = true;
    requestAnimationFrame(function(timestamp) {
        animate(timestamp);
    });
}

function newBall() {
    // Allow a maximum of 5 balls
    if (balls.length == 5) {
        window.alert("Maximum number of balls reached!");
    } else {
        // CHANGE COLOR NEEDS CHANGE!!!!!!!
        // Create new ball
        balls.push(new Ball("black"));
        currentBallIndex = currentBallIndex + 1;
    }    
    // Add a button 
    document.getElementById("ball-selector-" + (currentBallIndex + 1)).style.display = "inline-block";
}

// Reset state of simulation to default state
function reset() {
    // Reset all animation variables
    isRunning = false;
    startTime = null;
    setAll("starVelX", initVelX);
    setAll("starVelY", initVelY);
    setAll("starPosX", initPosX);
    setAll("starPosY", initPosY);
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
    const canvas = document.getElementById("layer1");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvasWidth, canvasHeight);
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
            canvasWidthReal = widthIn;
            canvasHeightReal = heightIn;

            // Convert real width and height to pixel values
            canvasWidth = Math.sqrt(canvasArea * canvasWidthReal / canvasHeightReal);
            canvasHeight = Math.sqrt(canvasArea * canvasHeightReal / canvasWidthReal);

            // Set canvas attributes to updated values
            $("#layer1").attr("width", canvasWidth);
            $("#layer1").attr("height", canvasHeight);
            $("#layer2").attr("width", canvasWidth);
            $("#layer2").attr("height", canvasHeight);  
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
            balls[0].posRealX = xIn;
            balls[0].posRealY = yIn;
            startPosX = xIn;
            startPosY = yIn;

            // Draw ball at new position
            balls[currentBallIndex].draw();
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
            startVelX = xIn;
            startVelY = yIn;
            balls[currentBallIndex].velX = xIn;
            balls[currentBallIndex].velY = yIn;

            // Draw ball at new position
            balls[currentBallIndex].draw();
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
            startVelX = Math.cos(rad(angleIn)) * speedIn;
            startVelY = Math.sin(rad(angleIn)) * speedIn;
            balls[currentBallIndex].velX = startVelX;
            balls[currentBallIndex].velY = startVelY;

            // Draw ball at new position
            balls[currentBallIndex].draw();
            // Print out new data
            printData(null);
        }
    }
}

// Output all ball data
function printData(time, slider = "") {
    posXDisplay.value = sigfigs(balls[currentBallIndex].posRealX, 4);
    posYDisplay.value = sigfigs(balls[currentBallIndex].posRealY, 4);
    velXDisplay.value = sigfigs(balls[currentBallIndex].velX, 4);
    velYDisplay.value = sigfigs(balls[currentBallIndex].velY, 4);
    speedDisplay.value = sigfigs(balls[currentBallIndex].speed, 4);
    angleDisplay.value = sigfigs(balls[currentBallIndex].angle, 4);
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
        balls[currentBallIndex].draw();
    }
}

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


//#region ---------------UTILITY FUNCTIONS------------------
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
function line(x1, y1, x2, y2, context, color = "black", width = 1) {
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = width;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

// Draw arrow
function arrow(x1, y1, x2, y2, context) {
    context.beginPath();
    const headLength = 10;
    const headAngle = 30;
    const angle = deg(Math.atan2(y2 - y1, x2 - x1));
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
    for (let i = 0; i < balls.length - 1; i++) {
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
//#endregion --------------------------------------------------


// -----------------------------------BALL CHANGE HANDLERS---------------------------------------------
function allOffOneOn(on) {
    for (let i = 1; i <= 5; i++) {
        document.getElementById("ball-selector-" + i).style.backgroundColor = null;
    }
    document.getElementById("ball-selector-" + on).style.backgroundColor = "green";
}
$(document).ready(function() {
    $("#ball-selector-1").click(function() {
        currentBallIndex = 0;
        allOffOneOn(1);
    });
    $("#ball-selector-2").click(function() {
        currentBallIndex = 1;
        allOffOneOn(2);
    });
    $("#ball-selector-3").click(function() {
        currentBallIndex = 2;
        allOffOneOn(3);
    });
    $("#ball-selector-4").click(function() {
        currentBallIndex = 3;
        allOffOneOn(4);
    });
    $("#ball-selector-5").click(function() {
        currentBallIndex = 4;
        allOffOneOn(5);
    });
});
// ----------------------------------------------------------------------------------------------------