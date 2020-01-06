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
    // Starting velocity
    startVelX = initVelX,
    startVelY = initVelY,
    // Starting position
    startPosX = initPosX,
    startPosY = initPosY,
    // Timer time
    timerTime = 0,
    // Starting time value at start of animation
    startTimerTime = 0;
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


let ball = {
    // Real position of the ball in meters
    posRealX: initPosX,
    posRealY: initPosY,
    // Scale real position of the ball to obtain pixel position of the ball
    get posX() {
        return (this.posRealX * canvasWidth / canvasWidthReal) + this.radius;
    },
    get posY() {
        return (canvasHeight - (this.posRealY * canvasHeight / canvasHeightReal)) - this.radius;
    },
    velX: initVelX,
    velY: initVelY,
    // Calculate magnitude of the velocity and its angle off the horizontal
    get speed() {
        return Math.sqrt(Math.pow(this.velX, 2) + Math.pow(this.velY, 2)); // c=√a²+b²
    },
    get angle() {
        return atan(this.velX, this.velY); // θ=arctan(Vy/Vx)
    },
    // Width of the ball
    radius: 10,
    draw: function() {
        const layer1 = document.getElementById("layer1");
        const context1 = layer1.getContext("2d");
        const layer2 = document.getElementById("layer2");
        const context2 = layer2.getContext("2d");

        // Cover previous frame
        context2.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw new frame
        context2.beginPath();
        context2.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI);
        context2.fillStyle = "#000000";
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

        // Draw trail
        if (document.getElementById("trail").checked == true) {
            // Ensures no trail is drawn when ball is manually dragged
            if (isRunning == true) {
                context1.fillRect(this.posX, this.posY, 2, 2);
            }
        }
    }
};


$(document).ready(function() {
    // Draw ball at initial position
    ball.draw();
    // Draw grid
    drawGrid();
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

    // Print out initial data
    printData(0);
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
        // If ball has made impact with ground
        let impact = false;

        // Time at which the ball is supposed to hit the ground
        const impactTime = (-startVelY - Math.sqrt(Math.pow(startVelY, 2) - 2*g*startPosY)) / g;

        // Check if time > time at which ball is supposed to hit the ground
        if (time > impactTime) {
            ball.posRealY = 0;
            isRunning = false;
            impact = true;
        } else {
            // Update ball's position
            ball.posRealY = startPosY + (startVelY*time) + (0.5*g*Math.pow(time, 2)); // s=ut+1/2at²
            ball.posRealX = startPosX + (startVelX*time); // s=vt

            // Update ball's velocity
            ball.velX = startVelX;
            ball.velY = startVelY + g*time;
        }

        // If the ball has hit the ground
        if (impact == true) {
            // Set timer time to time of impact
            if (timerInput.checked == true) {
                timerTime = startTimerTime + impactTime;
                window.alert("ball has reached the ground at time " + sigfigs(timerTime, 4));
            }
        } else {
            // Increment timer time
            if (timerInput.checked == true) {
                timerTime = startTimerTime + time;
            }
        }

        // Draw ball
        ball.draw();
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
            startVelX = ball.velX;
            startVelY = ball.velY;
            startPosX = ball.posRealX;
            startPosY = ball.posRealY;
        }

        // Pause the animation
        $("#pause").click(function() {
            isRunning = false;
        });
}
// ----------------------------------------------------------------------------------------------------


// -----------------------------------DRAG AND DROP BALL-----------------------------------------------
function drag(event) {
    if (isRunning == false) {
        const canvas = document.getElementById("layer2");
        if ((event.clientX < (ball.posX + ball.radius + canvasMargin)) && (event.clientX > (ball.posX - ball.radius + canvasMargin))) {
            if ((event.clientY < (ball.posY + ball.radius + canvasMargin)) && (event.clientY > (ball.posY - ball.radius + canvasMargin))) {
                canvas.addEventListener("mousemove", mousemove);
                canvas.addEventListener("mouseup", mouseup);
            }
        }
    }
}

function mousemove(event) {
    // Convert mouse position to real ball position
    const newX = (event.clientX - ball.radius - canvasMargin) * canvasWidthReal / canvasWidth;
    const newY = (canvasHeight - (event.clientY + ball.radius - canvasMargin)) * canvasHeightReal / canvasHeight;
    ball.posRealX = newX;
    ball.posRealY = newY;
    startPosX = newX;
    startPosY = newY;
    ball.draw();
    printData(null);
}

function mouseup(event) {
    const canvas = document.getElementById("layer2");
    canvas.removeEventListener("mousemove", mousemove);
    canvas.removeEventListener("mouseUp", mouseup);
}
// ----------------------------------------------------------------------------------------------------


// ----------------------------BUTTON CLICK HANDLERS AND OTHER FUNCTIONS-------------------------------
function startClick() {
    // Start animation
    isRunning = true;
    requestAnimationFrame(animate);
}

// Reset state of simulation to default state
function reset() {
    // Reset all animation variables
    isRunning = false;
    startTime = null;
    startVelX = initVelX;
    startVelY = initVelY;
    startPosX = initPosX;
    startPosY = initPosY;
    // Reset ball position
    ball.posRealX = initPosX;
    ball.posRealY = initPosY;
    // Reset ball velocity
    ball.velX = initVelX;
    ball.velY = initVelY;
    resetTimer();
    clearTrail();

    // Draw ball at new position
    ball.draw();
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
        const pos = canvasHeight - (ball.radius + (i * canvasHeight / canvasHeightReal));
        line(0, pos, canvasWidth, pos, context, gridColor);
    }
    // Draw vertical lines
    for (let i = 0; i <= canvasWidthReal; i++) {
        const pos =  ball.radius + (i * canvasWidth / canvasWidthReal);
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
            ball.draw();
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
            ball.posRealX = xIn;
            ball.posRealY = yIn;
            startPosX = xIn;
            startPosY = yIn;

            // Draw ball at new position
            ball.draw();
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
            ball.velX = xIn;
            ball.velY = yIn;

            // Draw ball at new position
            ball.draw();
            // Print out new data
            printData(null);
        }
    }
}

// Set initial polar velocity
function setVelPolar() {
    // only allow changes when simulation is paused
    if (isRunning == false) {
        const speedIn = speedDisplay.value;
        const angleIn = angleDisplay.value;
        if (validateFloat([speedIn]) && validateAngle([angleIn])) {
            startVelX = Math.cos(rad(angleIn)) * speedIn;
            startVelY = Math.sin(rad(angleIn)) * speedIn;
            ball.velX = startVelX;
            ball.velY = startVelY;

            // Draw ball at new position
            ball.draw();
            // Print out new data
            printData(null);
        }
    }
}

// Output all ball data
function printData(time, slider = "") {
    posXDisplay.value = sigfigs(ball.posRealX, 4);
    posYDisplay.value = sigfigs(ball.posRealY, 4);
    velXDisplay.value = sigfigs(ball.velX, 4);
    velYDisplay.value = sigfigs(ball.velY, 4);
    speedDisplay.value = sigfigs(ball.speed, 4);
    angleDisplay.value = sigfigs(ball.angle, 4);
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
// ----------------------------------------------------------------------------------------------------


// ---------------UTILITY FUNCTIONS------------------
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
    context.lineTo(x2 - headLength * Math.cos(rad(angle - headAngle)), y2 - headLength * Math.sin(rad(angle - headAngle)));
    context.moveTo(x2, y2);
    context.lineTo(x2 - headLength * Math.cos(rad(angle + headAngle)), y2 - headLength * Math.sin(rad(angle + headAngle)));        
    context.stroke();
}
// --------------------------------------------------