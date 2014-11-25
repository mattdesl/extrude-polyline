var Stroke = require('../')

var path = [
    [2, 0],
    [2, 10]
]

//could do with some real unit testing.
require('tape')('should extrude path', function(t) {
    var stroke = Stroke({ thickness: 2.5 })
    var mesh = stroke.build(path)

    t.deepEqual(mesh, { positions: [ [ 3.25, 0 ], [ 0.75, 0 ], [ 3.25, 10 ], [ 0.75, 10 ] ], cells: [ [ 0, 1, 2 ], [ 2, 1, 3 ] ] })
    t.end()
})