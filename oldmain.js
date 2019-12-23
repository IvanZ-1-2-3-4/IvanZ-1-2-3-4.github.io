// All lengths are in meters, all speeds are in m/s

const timeInt = 20;

let startTime = null;
let previousTimeStamp;
let ghleootim = null;
let ghleoovel = null;

let canvasWidthReal = 50;
let canvasHeightReal = 25;
let time = 0;
const canvasArea = 1000 * 500;
let isPlaying = false;

// Starting velocity of projection
let startVelY = 0;
let startPosY = canvasHeightReal;

let canvasWidth;
let canvasHeight;  

let posXDisplay = document.getElementById("posx");
let posYDisplay = document.getElementById("posy");
let speedDisplay = document.getElementById("speed");
let angleDisplay = document.getElementById("angle");
let velXDisplay = document.getElementById("velx");
let velYDisplay = document.getElementById("vely");

let ball = {
    // Ball's position in pixels
    posX: 0,
    posY: 0,
    // Ball's position in meters
    posRealX: this.posRealX * canvasWidth / canvasWidthReal,
    posRealY: canvasHeight - (this.posRealY * canvasHeight / canvasHeightReal),
    // The position of the ball at the previous fram
    previousX: 0,
    previousY: 0,
    // Ball's velocity in meters per second
    velX: 0,
    velY: 0,
    // Magnitude of ball's velocity
    speed: 0,
    // Direction of the ball's movement in radians
    angle: 0,
    // Ball's width in pixels
    width: 10,
    // Draw ball at current position
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
    // Get canvas width in pixels
    let str = $("#main-canvas").attr("width");
    canvasWidth = parseInt(str.substring(0, str.length - 1));
    str = $("#main-canvas").attr("height");
    canvasHeight = parseInt(str.substring(0, str.length - 1));  

    posXDisplay = document.getElementById("posx");
    posYDisplay = document.getElementById("posy");
    speedDisplay = document.getElementById("speed");
    angleDisplay = document.getElementById("angle");
    velXDisplay = document.getElementById("velx");
    velYDisplay = document.getElementById("vely");
    
    // Draw first instance of ball
    ball.draw();

    function runSimulation(timestamp) {
        // Set start time at start of projection
        if (!startTime) {
            startTime = timestamp;
            previousTimeStamp = startTime;
        }

        // Increment time
        time = (timestamp - startTime) / 1000;
        console.log("time: " + time);
        console.log("dif: " + (timestamp - previousTimeStamp));
        // Set previous timestamp to current timestamp
        previousTimeStamp = timestamp;

        // Calculate position
        if (ball.posY >= canvasHeight - ball.width) { // GHLEOO
            /*
            // GHLEOO = hitting the ground
            // IGNORE GHLEOO
            ball.posRealY = -canvasHeightReal;
            if (!ghleootim) ghleootim = time;
            if (!ghleoovel) ghleoovel = startVel + (-9.81 * time);
            console.log("GHLEOO TIME: " + ghleootim);
            console.log("GHLEOO VEL: " + ghleoovel);
            */
        } else {
            ball.posRealY = startPosY + (startVel * time) + (0.5 * (-9.81) * Math.pow(time, 2)); // ut + 1/2at²
            ball.velY = startVel + (-9.81 * time);
            console.log("POS: " + ball.posRealY);
        }
        
        // Scale real position to pixel position of the ball
        //ball.posX = ball.posRealX * canvasWidth / canvasWidthReal;
        //ball.posY = -ball.posRealY * canvasHeight / canvasHeightReal;

        // Draw the frame
        ball.draw();
        // Output ball stats
        printData();

        if (isPlaying == true) {
            requestAnimationFrame(runSimulation);
        }

        // End loop if paused
        $("#pause").click(function() {
            isPlaying = false;
            startTime = null;
        });
    }

    function printData() {
        // Update polar form of velocity
        ball.speed = Math.sqrt(Math.pow(ball.velX, 2) + Math.pow(ball.velY, 2)); // √(a²+b²)
        ball.angle = Math.atan(ball.velY / ball.velX);

        // Print data
        posXDisplay.value = ball.posRealX;
        posYDisplay.value = ball.posRealY;
        velXDisplay.value = ball.velX;
        velYDisplay.value = ball.velY;
        speedDisplay.value = ball.speed;
        angleDisplay.value = ball.angle / Math.PI * 180;
    }

    $("#set-dimensions").click(function() {
        canvasWidthReal = parseInt(document.getElementById("widthin").value);
        canvasHeightReal = parseInt(document.getElementById("heightin").value);
        $("#main-canvas").attr("width", Math.sqrt(canvasArea * canvasWidthReal / canvasHeightReal));
        $("#main-canvas").attr("height", Math.sqrt(canvasArea * canvasHeightReal / canvasWidthReal));
        ball.posRealY = canvasHeightReal / 2;
        
        let str = $("#main-canvas").attr("width");
        canvasWidth = parseInt(str.substring(0, str.length - 1));
        str = $("#main-canvas").attr("height");
        canvasHeight = parseInt(str.substring(0, str.length - 1));  

        ball.draw();
    });
});

$(document).keypress(function(event) {
    let keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == "13") {
        startProjection();
    }
});

function startProjection() {
    isPlaying = true;
    requestAnimationFrame(runSimulation);
    startVelY = ball.velY;
    startPosY = ball.posY;
    console.log("SAF");
}