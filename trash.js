// Adjust x-velocity and real x-position
if (ball.posX > canvasWidth - ball.width) {
    // If ball hits the right wall, reverse direction
    ball.velX = -ball.velX * 0.5;
    ball.posRealX = -(canvasWidth - ball.width) * widthReal / canvasWidth;
} else if (ball.posX < ball.width) {
    // If ball hits the left wall, reverse direction
    ball.velX = -ball.velX * 0.5;
    ball.posRealX = -ball.width * widthReal / canvasWidth;
}