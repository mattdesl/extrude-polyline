var stroke = require('../')()

require('canvas-testbed')(render, { once: true })

var path = [
    [35, 25],
    [105, 45],
    // [75, 130],
    [150, 15]
]

var draw = require('./draw-complex')

var data = new Float32Array(100 * 2)

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

function render(ctx, width, height) {
    ctx.save()  
    ctx.miterLimit = stroke.miterLimit = 1
    ctx.lineWidth = 20
    ctx.lineJoin = 'miter'
    ctx.lineCap = 'square'
    ctx.beginPath()
    path.forEach(function(p) {
        ctx.lineTo(p[0], p[1])
    })
    ctx.stroke()

    ctx.translate(100, 0)

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
    })

    // stroke.positions.forEach(function(p) {
    //     ctx.fillRect(p[0], p[1], 4, 4)
    // })
    
    ctx.restore()
}