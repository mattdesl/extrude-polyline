var stroke = require('../')()

require('canvas-testbed')(render, { once: false })
var vec = require('gl-vec2')
vec.create = function() { //for debugging
    return [0,0]
}
vec.clone = function(other) {
    return [other[0], other[1]]
}

var path = [
    [35, 75],
    [55, 55],
    [75, 80],
    [175, 130],
    // [215, 50],
    // [15, 130],
    // [110, 10],
    // [200, 100],
    // [200, 20],
]

var draw = require('./draw-complex')

var data = new Float32Array(100 * 2)

var touch = require('touch-position').emitter()

var array = require('array-range')
var hsv2rgb = require('color-convert').hsv2rgb
var random = require('randf')
var colorStyle = require('color-style')

var colors = array(50).map(function() {
    var h = random(0, 360),
        s = random(40, 50),
        v = random(40, 80)
    return hsv2rgb([h, s, v])
})

touch.on('move', function(x, y) {
    if (vec.distance(touch.position, path[path.length-1]) > 100)
        path.push(touch.position.slice())
})

var time = 0

function render(ctx, width, height, dt) {
    time+=dt

    ctx.clearRect(0,0,width,height)
    ctx.save()  
    ctx.miterLimit = stroke.miterLimit = 3

    ctx.lineWidth = 20
    ctx.lineJoin = stroke.joinType = 'miter'
    ctx.lineCap = stroke.capType = 'butt'
    ctx.beginPath()
    path.forEach(function(p) {
        ctx.lineTo(p[0], p[1])
    })
    ctx.stroke()

    ctx.translate(0, 0)

    stroke.thickness = 10 + Math.sin(time/1000 * 2)*10
    stroke.clear().path(path)
    
    stroke.cells.forEach(function(f, i) {
        ctx.beginPath()

        var v = stroke.positions
        var v0 = v[f[0]],
            v1 = v[f[1]],
            v2 = v[f[2]]
        ctx.moveTo(v0[0], v0[1])
        ctx.lineTo(v1[0], v1[1])
        ctx.lineTo(v2[0], v2[1])
        ctx.lineTo(v0[0], v0[1])

        ctx.fillStyle = colorStyle(colors[i%colors.length])
        ctx.fill()

        // ctx.fillStyle = 'black'
        // ctx.fillText(f[0], v0[0], v0[1])
        // ctx.fillText(f[1], v1[0], v1[1])
        // ctx.fillText(f[2], v2[0], v2[1])
    })

    stroke.positions.forEach(function(p) {
        ctx.fillStyle = 'red'
        var s = p[2] || 4
        // ctx.fillRect(p[0]-s/2, p[1]-s/2, s, s)
        
    })
    
    ctx.restore()
}