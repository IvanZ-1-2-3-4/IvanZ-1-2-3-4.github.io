// ---------------INIT VARIABLES---------------------
const initVelX = 3;
const initVelY = 4;
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
// If ball has made impact with the ground
let impact = false;
// Starting velocity
let startVelX = initVelX;
let startVelY = initVelY;
// Starting position
let startPosX = initPosX;
let startPosY = initPosX;
// Gravity
const g = -9.81;
// --------------------------------------------------


// ------------HTML ELEMENT VARIABLES----------------
// Ball stats display
let posXDisplay;
let posYDisplay;
let speedDisplay;
let angleDisplay;
let velXDisplay;
let velYDisplay;
// Canvas width display
let canvasWidthDisplay;
let canvasHeightDisplay;
// --------------------------------------------------


let ball = {
    // Real position of the ball in meters
    posRealX: initPosX,
    posRealY: initPosY,
    // Scale real position of the ball to obtain pixel position of the ball
    get posX() {
        return this.posRealX * canvasWidth / canvasWidthReal;
    },
    get posY() {
        return canvasHeight - (this.posRealY * canvasHeight / canvasHeightReal);
    },
    velX: initVelX,
    velY: initVelY,
    // Calculate magnitude of the velocity and its angle off the horizontal
    get speed() {
        return Math.sqrt(Math.pow(this.velX, 2) + Math.pow(this.velY, 2)); // c=√a²+b²
    },
    get angle() {
        return Math.atan(ball.velY / ball.velX) / Math.PI * 180; // θ=arctan(Vy/Vx)
    },
    // Position of the ball at previous frame
    prevX: -100,
    prevY: -100,
    // Width of the ball
    width: 10,
    draw: function() {
        let canvas = document.getElementById("main-canvas");
        let context = canvas.getContext("2d");

        // Cover previous frame
        context.beginPath();
        context.arc(this.prevX, this.prevY, this.width + 1, 0, 2 * Math.PI);
        context.fillStyle = "#ffffff";
        context.fill();

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
    canvasWidthDisplay = document.getElementById("width");
    canvasHeightDisplay = document.getElementById("height");
    // Print out initial data
    printData();
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
    let time = (timestamp - startTime) * 0.001;
    
    // Update ball's position
    // s=ut+1/2at²
    ball.posRealY = startPosY + (startVelY*time) + (0.5*g*Math.pow(time, 2));
    // s=vt
    ball.posRealX = startPosX + (startVelX*time);

    // Update ball's velocity
    ball.velX = startVelX;
    ball.velY = startVelY + g*time;

    // Draw ball
    ball.draw();

    // Output ball stats
    printData();

    // Continue or suspend the animation
    if (isRunning == true) {
        requestAnimationFrame(animate);
    } else {
        if (impact == false) {
            // Precisely determine new ball velocity
            startVelY = startVelY + g*time;
            startPosY = ball.posRealY;
            startPosX = ball.posRealX;
        } else {
            // Ball stays at ground
        }
        // Reset start time
        startTime = null;
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
    startVelX = 0;
    startVelY = 0;
    startPosX = 0;
    startPosY = canvasHeightReal;
    // Reset ball position
    ball.posRealX = 0;
    ball.posRealY = canvasHeightReal;

    // Draw ball at new position
    ball.draw();
    // Print out new data
    printData();
}

// Change dimensions of canvas
function setDim() {
    // Only allow changes when simulation is running
    if (isRunning == false) {
        // Get input width and height
        canvasWidthReal = parseInt(document.getElementById("width").value);
        canvasHeightReal = parseInt(document.getElementById("height").value);

        // Convert real width and height to pixel values
        canvasWidth = Math.sqrt(canvasArea * canvasWidthReal / canvasHeightReal);
        canvasHeight = Math.sqrt(canvasArea * canvasHeightReal / canvasWidthReal);

        // Set canvas attributes to updated values
        $("#main-canvas").attr("width", canvasWidth);
        $("#main-canvas").attr("height", canvasHeight);

        // Draw ball at new position
        ball.draw();
        // Print out new data
        printData();
    }
}

// Set initial position
function setPos() {
    // Only allow changes when simulation is running
    if (isRunning == false) {
        ball.posRealX = parseInt(posXDisplay.value);
        ball.posRealY = parseInt(posYDisplay.value);
        startPosX = parseInt(posXDisplay.value);
        startPosY = parseInt(posYDisplay.value);

        // Draw ball at new position
        ball.draw();
        // Print out new data
        printData();
    }
}

// Set initial velocity
function setVel() {
    // Only allow changes when simulation is running
    if (isRunning == false) {
        startVelX = parseInt(velXDisplay.value);
        startVelY = parseInt(velYDisplay.value);
        ball.velX = parseInt(velXDisplay.value);
        ball.velY = parseInt(velYDisplay.value);

        // Draw ball at new position
        ball.draw();
        // Print out new data
        printData();
    }
}

function printData() {
    // Output all ball data
    posXDisplay.value = ball.posRealX;
    posYDisplay.value = ball.posRealY;
    velXDisplay.value = ball.velX;
    velYDisplay.value = ball.velY;
    speedDisplay.value = ball.speed;
    angleDisplay.value = ball.angle;
}
// ----------------------------------------------------------------------------------------------------