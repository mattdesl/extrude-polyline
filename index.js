var vec = require('gl-vec2')

var tmp = vec.create()
var perp = vec.create()
var capStart = vec.create()
var capEnd = vec.create()

var lineA = vec.create()
var lineB = vec.create()
var tangent = vec.create()
var miter = vec.create()

var BUTT = 0, SQUARE = 1, ROUND = 2
var MITER = 0, BEVEL = 1, ROUND = 2
var capType = SQUARE
var joinType = BEVEL

function copy(array, offset, vec) {
    array[offset] = vec[0]
    array[offset+1] = vec[1]
}


function Stroke(path) {
    if (!(this instanceof Stroke))
        return new Stroke(path)
    this.previous = null
    this.index = 0
    this.stride = 2
    this.positions = []
    this.miterLimit = 10
    this.cells = []
}

Stroke.prototype.clear = function() {
    this.previous = null
    this.index = 0
    this.positions.length = 0
    this.cells.length = 0
    return this
}

Stroke.prototype._join = function(index, cur, last, next, halfThick) {
    var cells = this.cells
    var positions = this.positions



    //get unit dir of two lines
    vec.subtract(lineA, next, cur)
    vec.normalize(lineA, lineA)

    vec.subtract(lineB, cur, last)
    vec.normalize(lineB, lineB)
    
    //get tangent line
    vec.add(tangent, lineA, lineB)
    vec.normalize(tangent, tangent)

    //get perpendicular A
    vec.set(perp, -lineB[1], lineB[0])

    //get miter as a unit vector
    vec.set(miter, -tangent[1], tangent[0])
    //get the necessary length of our miter
    var len = halfThick / vec.dot(miter, perp)
    var bevel = joinType === BEVEL
    if (!bevel && joinType === MITER) {
        // if (len / (halfThick*2) > miterLimit) {
            // bevel = true
        // }

        // var angle = Math.atan2(next[1]-last[1], next[0]-last[0])
        // var limit = 1/Math.sin(angle/2)
        var limit = len / (halfThick)
        console.log(limit, this.miterLimit)
        if (limit > this.miterLimit)
            bevel = true
    }

    //now do the regular segmenting
    
    //scale perp based on thickness
    vec.scale(perp, perp, halfThick)
    
    var flip = vec.dot(tangent, perp) < 0

    //first two points in our segment as well as the correct cells
    this._segmentStart(index, lineB, perp, last, halfThick)

    //if the end cap is type square, we can just push the verts out a bit
    if (capType === SQUARE) {
        vec.scaleAndAdd(capEnd, next, lineA, halfThick)
        next = capEnd
    }

    // bevel = true
    if (bevel) {
        //next two points in our first segment
        vec.scaleAndAdd(tmp, cur, perp, -1)
        positions.push(vec.clone(tmp))

        vec.scaleAndAdd(tmp, cur, miter, len)
        positions.push(vec.clone(tmp))

        console.log(flip)

        cells.push([index+2, index+1, index+3])

        //bevel triangle
        cells.push([index+2, index+3, index+4])

        //get second normal
        vec.set(perp, -lineA[1], lineA[0])
        vec.scale(perp, perp, halfThick)

        //next point in our bevel
        vec.scaleAndAdd(tmp, cur, perp, -1)
        positions.push(vec.clone(tmp))

        //next two points in our second segment
        vec.subtract(tmp, next, perp)
        positions.push(vec.clone(tmp))
        cells.push([index+4, index+3, index+5])

        vec.add(tmp, next, perp)
        positions.push(vec.clone(tmp))
        cells.push([index+5, index+3, index+6])
    } else {
        //next two points in our first segment
        vec.scaleAndAdd(tmp, cur, miter, -len)
        positions.push(vec.clone(tmp))

        vec.scaleAndAdd(tmp, cur, miter, len)
        positions.push(vec.clone(tmp))
        cells.push([index+2, index+1, index+3])

        //get second normal
        vec.set(perp, -lineA[1], lineA[0])
        vec.scale(perp, perp, halfThick)


        //next two points in our second segment
        vec.subtract(tmp, next, perp)
        positions.push(vec.clone(tmp))
        cells.push([index+2, index+3, index+4])

        vec.add(tmp, next, perp)
        positions.push(vec.clone(tmp))
        cells.push([index+4, index+3, index+5])
    }

        
}

Stroke.prototype._segmentStart = function(index, normal, perp, last, halfThick) {
    var cells = this.cells
    var positions = this.positions

    //add start cap
    if (index === 0) {
        if (capType === SQUARE) {
            vec.scaleAndAdd(capStart, last, normal, -halfThick)
            last = capStart
        } else if (capType === ROUND) {

        }
    }

    //and add the points
    vec.subtract(tmp, last, perp)
    positions.push(vec.clone(tmp))

    vec.add(tmp, last, perp)
    positions.push(vec.clone(tmp))
    cells.push([index+0, index+1, index+2])
}

Stroke.prototype._segment = function(index, cur, last, halfThick) {
    var cells = this.cells
    var positions = this.positions

    //get unit dir of line
    vec.subtract(tmp, cur, last)
    vec.normalize(tmp, tmp)

    //if the end cap is type square, we can just push the verts out a bit
    if (capType === SQUARE) {
        vec.scaleAndAdd(capEnd, cur, tmp, halfThick)
        cur = capEnd
    }

    //get perpendicular
    vec.set(perp, -tmp[1], tmp[0])

    //now scale based on thickness
    vec.scale(perp, perp, halfThick)

    //first two points in our segment
    this._segmentStart(index, tmp, perp, last, halfThick)


    //next two points to end our segment
    vec.subtract(tmp, cur, perp)
    positions.push(vec.clone(tmp))

    vec.add(tmp, cur, perp)
    positions.push(vec.clone(tmp))
    cells.push([index+2, index+1, index+3])
}

Stroke.prototype.path = function(points) {
    if (points.length <= 1)
        return

    var cells = this.cells
    var positions = this.positions
    var thickness = 20
    var halfThick = thickness / 2
    var total = points.length

    if (total === 2) {
        this._segment(0, points[1], points[0], halfThick)
    } else {
        //join each segment
        for (var i=1, count=0; i<total-1; i++) {
            var last = points[i-1]
            var cur = points[i]
            var next = points[i+1]

            this._join(count, cur, last, next, halfThick)
            count+=6
        }
    }

        

    //add end cap
}

// module.exports.flat = function strokeFlat(path, data, stride, offset, count) {
//     offset = offset||0
//     stride = stride||2
//     //single point.. no line
//     if (path.length < 2) {
//         if (path.length === 1)
//             copy(data, offset, path[0])
//         return
//     }
// }

module.exports = Stroke