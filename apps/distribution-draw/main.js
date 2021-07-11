let xVals = '"x"',
    yVals = '"y"',
    distrDisplay,
    download,
    canvasWidth = 1000,
    canvasHeight = 500,
    gridlineNumber = 20,
    highY = 1,
    lowY = 0,
    highX = 1,
    lowX = 0

window.onload = function() {
    document.getElementById('line-layer').addEventListener("mousedown", (event) => {
        draw(event)
        document.getElementById('line-layer').addEventListener('mousemove', draw)
        document.addEventListener('mouseup', mouseup)
    })
    download = document.getElementById('download')
    download.download = 'distribution.csv'
    distrDisplay = document.getElementById('value')
    document.getElementById("gridline-slider").oninput = gridlineSliderInput
    drawGridlines()
}

function gridlineSliderInput() {
    gridlineNumber = parseInt(this.value)
    document.getElementById('gridline-value').innerHTML = `Number of gridlines=${gridlineNumber}`
    drawGridlines()
}

function draw(event) {
    let c = document.getElementById('line-layer')
    ctx = c.getContext('2d')
    ctx.fillStyle = '000000'
    ctx.fillRect(event.clientX, event.clientY, 1, 1)

    let x = lowX + (event.clientX / canvasWidth) * (highX - lowX)
    let y = lowY + ((canvasHeight - event.clientY) / canvasHeight) * (highY - lowY)

    distrDisplay.innerHTML = `x=${x}</br>y=${y}`
    xVals = `${xVals},${x}`
    yVals = `${yVals},${y}`
    
    const blob = new Blob([`${xVals}\n${yVals}`], {type : 'text/csv'})
    download.href = (window.webkitURL || window.URL).createObjectURL(blob)
    download.dataset.downloadurl = ['text/csv', download.download, download.href].join(':')
}

function drawGridlines() {
    const c = document.getElementById("grid-layer")
    const ctx = c.getContext('2d')
    const gridColor = "#999999";
    
    // Clear old grid
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    let numLabels = Math.min(gridlineNumber, 30)

    // Draw grid
    // Draw horizontal lines
    for (let i = 1; i <= gridlineNumber; i++) {
        const pos = i * (canvasHeight / (gridlineNumber + 1))
        line(0, pos, canvasWidth, pos, ctx, gridColor)
        if ((i % (Math.ceil(gridlineNumber / 30))) == 0) {
            ctx.fillText(`${Number.parseFloat(1 - (highY / (gridlineNumber + 1) * i)).toPrecision(3)}`, 0, pos)
        }
    }
    // Draw vertical lines
    for (let i = 1; i <= gridlineNumber; i++) {
        const pos = i * (canvasWidth / (gridlineNumber + 1))
        line(pos, 0, pos, canvasWidth, ctx, gridColor)
        if ((i % (Math.ceil(gridlineNumber / 30))) == 0) {
            ctx.fillText(`${Number.parseFloat((highY / (gridlineNumber + 1) * i)).toPrecision(3)}`, pos, canvasHeight)
        }
    }
}

function mouseup() {
    document.getElementById('line-layer').removeEventListener('mousemove', draw)
    document.getElementById('line-layer').removeEventListener('mouseup', mouseup)
}


function line(x1, y1, x2, y2, context, color = "black") {
    context.beginPath();
    context.strokeStyle = color;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}


function changeParam(param) {
    let hx = document.getElementById('highx'),
        hy = document.getElementById('highy'),
        lx = document.getElementById('lowx'),
        ly = document.getElementById('lowy')
    switch (param) {
        case 'hx':
            if (parseFloat(hx.value)) {
                highX = parseFloat(hx.value)
            }
            break
        case 'hy':
            if (parseFloat(hy.value)) {
                highY = parseFloat(hy.value)
            }
            break
        case 'ly':
            if (parseFloat(ly.value)) {
                lowY = parseFloat(ly.value)
            }
            break
        case 'lx':
            if (parseFloat(lx.value)) {
                lowX = parseFloat(lx.value)
            }
            break
        case 'startx':

    }
    drawGridlines()
}