var number = require('as-number')
var array = require('array-range')
var hsv2rgb = require('color-convert').hsv2rgb
var random = require('randf')

module.exports = function(n) {
    n = number(n, 50)
    return array(n).map(function() {
        var h = random(0, 360),
            s = random(40, 50),
            v = random(40, 80)
        return hsv2rgb([h, s, v])
    })
}