let hp = 500, // height pixel
    wp = 500, // width pixel
    hr = 10, // height real
    wr = 10, // width real
    fd = 30, // frame delay
    tp = false, // t previous
    ctx

onload = function() {
    ctx = document.getElementById('canvas').getContext('2d')
    ctx.fillStyle = '#000000'
    ctx.strokeStyle = '#000000'
}

function point(x, y, r = 5) {
    ctx.rect(rtpx(x), rtpy(y), r, r)
    ctx.fill()
}

function clear() {
    ctx.clearRect(wp, hp, 0, 0)
}

function line(x1, y1, x2, y2) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
}

function rtpx(x) { // Real to pixel for x values
    return (
        (x + (wr / 2)) * (wp / wr)
    )
}

function rtpy(y) { // Real to pixel for y values 
    return (
        hp - ((y + (hr / 2)) * (hp / hr))
    )
}












class Cube {
    constructor(x, y, z, r = 1) {
        this.vertices = [
            new Vertex(x - r, y - r, z - r),
            new Vertex(x - r, y - r, z + r),
            new Vertex(x - r, y + r, z - r),
            new Vertex(x - r, y + r, z + r),
            new Vertex(x + r, y - r, z - r),
            new Vertex(x + r, y - r, z + r),
            new Vertex(x + r, y + r, z - r),
            new Vertex(x + r, y + r, z + r)
        ]
    }
}

class Card {
    constructor(x, y, z, r = 1) {
        this.vertices = [
            new Vertex(x - r, y - r, z),
            new Vertex(x - r, y + r, z),
            new Vertex(x + r, y - r, z),
            new Vertex(x + r, y + r, z)
        ]

    }

    draw() {
        for (let v in this.vertices) {
            v = this.vertices[v]
            v.draw()
        }
    }

    spinny(angle) {
        for (let v in this.vertices) {
            v = this.vertices[v]
            
        }
    }
}

class Vertex {
    constructor(x, y, z, brothers = null) {
        this.x = x
        this.y = y
        this.z = z
        this.brothers = brothers
    }

    draw() {
        point(this.x, this.y)
    }
}

function frame(t) {
    if (!tp) {
        tp = t
        requestAnimationFrame(frame)
    } else if ((t - tp) > fd) {
        clear()
        card.draw()
    } else { requestAnimationFrame(frame) }
}



let card = new Card(0, 0, 0)
requestAnimationFrame(frame)

