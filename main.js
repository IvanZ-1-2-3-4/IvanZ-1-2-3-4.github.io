// ---------------INIT VARIABLES---------------------
const initVelX = 50/(Math.sqrt(50*9.81)/9.81)/2;
const initVelY = Math.sqrt(50*9.81);
const initPosX = 0;
const initPosY = 0;
// --------------------------------------------------


// ---------------CANVAS VARIABLES-------------------
// All lengths are in meters, all speeds are in m/s
const canvasArea = 1000 * 500;
let canvasWidthReal = 50;
let canvasHeightReal = 25;
let canvasWidth = Math.sqrt(canvasArea * canvasWidthReal / canvasHeightReal);
let canvasHeight = Math.sqrt(canvasArea * canvasHeightReal / canvasWidthReal);
// --------------------------------------------------


// -----------ANIMATION UTILITY VARIABLES------------
// Time at the start of an animation
let startTime = null;
// Is animation running
let isRunning = false;
// Starting velocity
let startVelX = initVelX;
let startVelY = initVelY;
// Starting position
let startPosX = initPosX;
let startPosY = initPosY;
// Gravity
const g = -9.81;
// Timer time
let timerTime = 0;
// Starting time value at start of animation
let startTimerTime = 0;
// --------------------------------------------------


// ------------HTML ELEMENT VARIABLES----------------
// Ball stats display
let posXDisplay;
let posYDisplay;
let speedDisplay;
let angleDisplay;
let velXDisplay;
let velYDisplay;
let timeDisplay;
// Canvas width display
let canvasWidthDisplay;
let canvasHeightDisplay;
//Checkboxes
let timerInput;
let trailInput;
// --------------------------------------------------


let ball = {
    // Real position of the ball in meters
    posRealX: initPosX,
    posRealY: initPosY,
    // Scale real position of the ball to obtain pixel position of the ball
    get posX() {
        return (this.posRealX * canvasWidth / canvasWidthReal) + this.width;
    },
    get posY() {
        return (canvasHeight - (this.posRealY * canvasHeight / canvasHeightReal)) - this.width;
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
    // Position of the ball at previous frame
    prevX: -100,
    prevY: -100,
    // Width of the ball
    width: 10,
    draw: function() {
        let canvas = document.getElementById("main-canvas");
        let context = canvas.getContext("2d");

        /* Cover previous frame
        context.beginPath();
        context.arc(this.prevX, this.prevY, this.width+1, 0, 2 * Math.PI);
        context.fillStyle = "#ffffff";
        context.fill();*/

        context.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw new frame
        context.beginPath();
        context.arc(this.posX, this.posY, this.width, 0, 2 * Math.PI);
        context.fillStyle = "#000000";
        context.fill();

        if (document.getElementById("trail").value == "trail") {
            context.beginPath();
            context.arc(this.posX, this.posY, 1, 0, 2 * Math.PI);
            context.fill();
        }

        // Update previous coordinates
        this.prevX = this.posX;
        this.prevY = this.posY;
    }
};

$(document).ready(function() {
    // Draw ball at initial position
    ball.draw();
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
    trailInput = document.getElementById("trail");
    // Print out initial data
    printData(0);
});


// -----------------------------------MAIN ANIMATION FUNCTION------------------------------------------
function animate(timestamp) {
    // If animation is not running, starTime will be set to null
    if (!startTime) {
        // Set start time
        startTime = timestamp;
        // Reset total time
        totalTime = 0;
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
            window.alert("ball has reached the ground at time " + timerTime);
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
    // Reset timer
    resetTimer();

    // Draw ball at new position
    ball.draw();
    // Print out new data
    printData(0);
}

function resetTimer() {
    // Only allow changes when simulation is paused
    if (isRunning == false) {
        timerTime = 0;
        startTimerTime = 0;
        printData(0);
    }
}

// Change dimensions of canvas
function setDim() {
    // Only allow changes when simulation is paused
    if (isRunning == false) {
        // Get input width and height
        canvasWidthReal = parseFloat(document.getElementById("width").value);
        canvasHeightReal = parseFloat(document.getElementById("height").value);

        // Convert real width and height to pixel values
        canvasWidth = Math.sqrt(canvasArea * canvasWidthReal / canvasHeightReal);
        canvasHeight = Math.sqrt(canvasArea * canvasHeightReal / canvasWidthReal);

        // Set canvas attributes to updated values
        $("#main-canvas").attr("width", canvasWidth);
        $("#main-canvas").attr("height", canvasHeight);

        // Draw ball at new position
        ball.draw();
        // Print out new data
        printData(null);
    }
}

// Set initial position
function setPos() {
    // Only allow changes when simulation is paused
    if (isRunning == false) {
        ball.posRealX = parseFloat(posXDisplay.value);
        ball.posRealY = parseFloat(posYDisplay.value);
        startPosX = parseFloat(posXDisplay.value);
        startPosY = parseFloat(posYDisplay.value);

        // Draw ball at new position
        ball.draw();
        // Print out new data
        printData(null);
    }
}

// Set initial rectangular velocity
function setVelRect() {
    // Only allow changes when simulation is paused
    if (isRunning == false) {
        startVelX = parseFloat(velXDisplay.value);
        startVelY = parseFloat(velYDisplay.value);
        ball.velX = parseFloat(velXDisplay.value);
        ball.velY = parseFloat(velYDisplay.value);

        // Draw ball at new position
        ball.draw();
        // Print out new data
        printData(null);
    }
}

// Set initial polar velocity
function setVelPolar() {
    // only allow changes when simulation is paused
    if (isRunning == false) {
        const speed = document.getElementById("speed").value;
        const angle = document.getElementById("angle").value;
        startVelX = Math.cos(rad(angle)) * speed;
        startVelY = Math.sin(rad(angle)) * speed;
        ball.velX = startVelX;
        ball.velY = startVelY;
    }

    // Draw ball at new position
    ball.draw();
    // Print out new data
    printData(null);
}

// Output all ball data
function printData(time) {
    posXDisplay.value = ball.posRealX;
    posYDisplay.value = ball.posRealY;
    velXDisplay.value = ball.velX;
    velYDisplay.value = ball.velY;
    speedDisplay.value = ball.speed;
    angleDisplay.value = ball.angle;
    // If not time update is needed, the parameter is passed as null
    if (!(time == null)) {
        timeDisplay.innerHTML = String(time).substring(0, 5);
    }
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
// --------------------------------------------------