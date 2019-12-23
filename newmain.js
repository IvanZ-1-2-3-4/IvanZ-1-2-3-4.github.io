// All lengths are in meters, all speeds are in m/s
let canvasWidthReal = 50;
let canvasHeightReal = 25;
const canvasArea = 1000 * 500;

let startTime = null;

let canvasWidth = 1000;
let canvasHeight = 500;

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
    previousX: 0,
    previousY: 50,
    velX: 0,
    velY: 0,
    draw: function() {
        let canvas = document.getElementById("main-canvas");
        let context = canvas.getContext("2d");

        // Cover previous frame
        context.beginPath();
        context.arc(this.previousX, this.previousY, this.width + 1, 0, 2 * Math.PI);
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
        this.previousX = this.posX;
        this.previousY = this.posY;
    }
};

$(document).ready(function() {
    ball.draw();
});

function animate(timestamp, initPosX, initPosY) {
    // If animation is not running, starTime will be set to null
    if (!startTime) {
        startTime = timestamp;
    }
    let time = timestamp - startTime;

    ball.posRealY = ball.star
}