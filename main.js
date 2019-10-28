$(document).ready(function() {
    // All lengths are in meters, all speeds are in m/s

    let timeInt = 20;

    let widthReal = 100;
    let heightReal = 50;
    let time = 0;
    const canvasArea = 1000 * 500;
    let isPlaying = false;

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
        posRealX: 0,
        posRealY: 0,
        // The position of the ball at the previous fram
        previousX: 0,
        previousY: 0,
        // Ball's velocity in meters per second
        velX: 0,
        velY: 50,
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

            // Update previous coordinates
            this.previousX = this.posX;
            this.previousY = this.posY;
        }
    };
    console.log(ball.posRealX);
    ball.draw();

    $("#play").click(function() {runSimulation();}); // This is so retarded oh so retarded

    $("#set-dimensions").click(function() {
        widthReal = parseInt(document.getElementById("widthin").value);
        heightReal = parseInt(document.getElementById("heightin").value);
        $("#main-canvas").attr("width", Math.sqrt(canvasArea * widthReal / heightReal));
        $("#main-canvas").attr("height", Math.sqrt(canvasArea * heightReal / widthReal));
        ball.posRealY = heightReal / 2;
        ball.draw();
    });

    function runSimulation() {
        isPlaying = true;

        // Get canvas width in pixels
        let str = $("#main-canvas").attr("width");
        let canvasWidth = parseInt(str.substring(0, str.length - 1));
        str = $("#main-canvas").attr("height");
        let canvasHeight = parseInt(str.substring(0, str.length - 1));  

        // Animation loop
        let play = setInterval(function() {

            // Adjust y-velocity and real y-position
            if (ball.posY > canvasHeight - ball.width) {
                // If ball hits the ground, reverse direction
                ball.velY = -ball.velY * 0.5;
                ball.posRealY = -(canvasHeight - ball.width) * heightReal / canvasHeight;
            } else {
                // Accelerate downwards by 9.81 meters per second squared
                ball.velY = ball.velY - (9.81 * timeInt / 1000);
                ball.posRealY = (ball.posRealY + ball.velY) * timeInt / 1000;
            }

            updateSpeed();

            // Update ball's real position
            ball.posRealX = ball.posRealX + ball.velX;
            console.log("real: " + ball.posRealX + "," + ball.posRealY);

            // Convert real position to pixel position
            ball.posX = ball.posRealX * canvasWidth / widthReal;
            ball.posY = -ball.posRealY * canvasHeight / heightReal;

            // Draw the frame
            ball.draw();
            // Output ball stats
            printData();

            // End loop if paused
            $("#pause").click(function() {
                clearInterval(play);
                isPlaying = false;
            });
        }, timeInt);
    }

    function updateSpeed() {
        ball.speed = Math.sqrt(Math.pow(ball.velX, 2) + Math.pow(ball.velY, 2));
        ball.angle = Math.atan(ball.velY / ball.velX);
    }

    function printData() {
        posXDisplay.value = ball.posRealX;
        posYDisplay.value = ball.posRealY;
        velXDisplay.value = ball.velX;
        velYDisplay.value = ball.velY;
        speedDisplay.value = ball.speed;
        angleDisplay.value = ball.angle / Math.PI * 180;
    }
});