// ---------------CANVAS VARIABLES-------------------
// All lengths are in meters, all speeds are in m/s
let canvasWidthReal = 50;
let canvasHeightReal = 25;
let canvasWidth = 1000;
let canvasHeight = 500;
const canvasArea = 1000 * 500;
// --------------------------------------------------


// -----------ANIMATION UTILITY VARIABLES------------
// Time at the start of an animation
let startTime = null;
// Is animation running
let isRunning = false;
// Starting velocity
let startVelX;
let startVelY;
// Gravity
const g = -9.81;
// --------------------------------------------------


let ball = {
    posRealX: 0,
    posRealY: 50,
    posRealStart: 50,
    posRealStartY: 0,
    get posX() {
        return this.posRealX * canvasWidth / canvasWidthReal;
    },
    get posY() {
        return canvasHeight - (this.posRealY * canvasHeight / canvasHeightReal);
    },
    prevX: 0,
    prevY: 50,
    velX: 0,
    velY: 0,
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
    ball.draw();
    requestAnimationFrame(animate);
});

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
    
    // Update ball's position using s=ut+1/2at²
    ball.posRealY = ball.startVelY*time + 0.5*g*Math.pow(time, 2); 

    // Continue or suspend the simulation
    if (isRunning == true) {
        requestAnimationFrame(animate);
    } else {
        // Set ball position and velocity to precisely determined position and velocity
        
    }

    // Pause the simulation
    $("#pause").click(function() {
        isRunning = false;
    });
}