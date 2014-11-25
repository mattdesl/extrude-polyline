require('canvas-testbed')(render)

var stroke = require('../')()
var vec = require('gl-vec2')

var path = [],
    thicknesses = []

var draw = require('./draw-complex')
var touch = require('touch-position').emitter()
var colorStyle = require('color-style')

var smoothstep = require('smoothstep')
var clamp = require('clamp')

touch.on('move', function(x, y) {
    var dist = path.length===0 ? 0 : vec.distance(touch.position, path[path.length-1])
    stroke.thickness = dist

    if (path.length===0 || dist > 3) {
        if (path.length > 150) {
            path.shift()
            thicknesses.shift()
        }

        path.push(touch.position.slice())
        dist = clamp(smoothstep(0, 1, dist/50), 0, 1)
        thicknesses.push(dist)
    }
})

stroke.mapThickness = function(point, index, points) {
    return index/(points.length-1) * thicknesses[index] * 30
}

var time = 0

function render(ctx, width, height, dt) {
    time+=dt

    ctx.clearRect(0,0,width,height)
    ctx.save()  
    stroke.miterLimit = 3

    var mesh = stroke.build(path)

    mesh.cells.forEach(function(f, i) {
        ctx.beginPath()

        var v = mesh.positions
        var v0 = v[f[0]],
            v1 = v[f[1]],
            v2 = v[f[2]]
        ctx.moveTo(v0[0], v0[1])
        ctx.lineTo(v1[0], v1[1])
        ctx.lineTo(v2[0], v2[1])
        ctx.lineTo(v0[0], v0[1])

        var thick = thicknesses[f[0]]
        var color = colorStyle.hsl(250, thick*100, 75)
        ctx.strokeStyle = colorStyle(color)
        ctx.stroke()
    })

    ctx.restore()
}