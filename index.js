var vec = require('gl-vec2')


var tmp = vec.create()
var perp = vec.create()
var capStart = vec.create()
var capEnd = vec.create()

var lineA = vec.create()
var lineB = vec.create()
var tangent = vec.create()
var miter = vec.create()

function copy(array, offset, vec) {
    array[offset] = vec[0]
    array[offset+1] = vec[1]
}


function Stroke(path) {
    if (!(this instanceof Stroke))
        return new Stroke(path)
    this.cells = []
    this.positions = []
    this.miterLimit = 10
    this.thickness = 1
    this.joinType = 'miter'
    this.capType = 'butt'

    this._normal = null
    this._lastFlip = -1
    this._started = false
}

Stroke.prototype.clear = function() {
    this.index = 0
    this.positions.length = 0
    this.cells.length = 0
    this._lastFlip = -1
    this._started = false
    this._normal = null
    return this
}

Stroke.prototype._seg = function(index, last, cur, next) {
    var cells = this.cells
    var positions = this.positions
    var halfThick = this.thickness/2
    var count = 0

    var capSquare = this.capType === 'square'
    var joinBevel = this.joinType === 'bevel'

    //get unit direction of line
    direction(lineA, cur, last)

    //if we don't yet have a normal from previous join,
    //compute based on line start - end
    if (!this._normal) {
        this._normal = vec.create()
        normal(this._normal, lineA)
    }

    //if we haven't started yet, add the first two points
    if (!this._started) {
        this._started = true

        //if the end cap is type square, we can just push the verts out a bit
        if (capSquare) {
            vec.scaleAndAdd(capEnd, last, lineA, -halfThick)
            last = capEnd
        }

        extrusions(positions, last, this._normal, halfThick)
    }

    cells.push([index+0, index+1, index+2])

    /*
    // now determine the type of join with next segment

    - round
    - bevel
    - miter
    - none (i.e. no next segment, use normal)
     */

     
     if (!next) { //no next segment, simple extrusion
        //now reset normal to finish cap
        normal(this._normal, lineA)

        //push square end cap out a bit
        if (capSquare) {
            vec.scaleAndAdd(capEnd, cur, lineA, halfThick)
            cur = capEnd
        }

        extrusions(positions, cur, this._normal, halfThick)
        cells.push(this._lastFlip===1 ? [index, index+2, index+3] : [index+2, index+1, index+3])

        count += 2
     } else { //we have a next segment, start with miter
        //get unit dir of next line
        direction(lineB, next, cur)

        //stores tangent & miter
        var miterLen = computeMiter(tangent, miter, lineA, lineB, halfThick)

        // normal(tmp, lineA)
        
        //get orientation
        var flip = (vec.dot(tangent, this._normal) < 0) ? -1 : 1

        var bevel = joinBevel
        if (!bevel && this.joinType === 'miter') {
            // var angle = Math.atan2(next[1]-last[1], next[0]-last[0])
            // var limit = 1/Math.sin(angle/2)
            var limit = miterLen / (halfThick)
            if (limit > this.miterLimit)
                bevel = true
        }

        if (bevel) {    
            //next two points in our first segment
            vec.scaleAndAdd(tmp, cur, this._normal, -halfThick * flip)
            positions.push(vec.clone(tmp))
            vec.scaleAndAdd(tmp, cur, miter, miterLen * flip)
            positions.push(vec.clone(tmp))


            cells.push(this._lastFlip!==-flip
                    ? [index, index+2, index+3] 
                    : [index+2, index+1, index+3])
            

            //now add the bevel triangle
            cells.push([index+2, index+3, index+4])

            normal(tmp, lineB)
            vec.copy(this._normal, tmp) //store normal for next round

            vec.scaleAndAdd(tmp, cur, tmp, -halfThick*flip)
            positions.push(vec.clone(tmp))

            // //the miter is now the normal for our next join
            count += 3
        } else { //miter
            //next two points for our miter join
            extrusions(positions, cur, miter, miterLen)
            cells.push([index+2, index+1, index+3])
            flip = -1

            //the miter is now the normal for our next join
            vec.copy(this._normal, miter)
            count += 2
        }
        this._lastFlip = flip
     }
     return count
}


function computeMiter(tangent, miter, lineA, lineB, halfThick) {
    //get tangent line
    vec.add(tangent, lineA, lineB)
    vec.normalize(tangent, tangent)

    //get miter as a unit vector
    vec.set(miter, -tangent[1], tangent[0])
    vec.set(tmp, -lineA[1], lineA[0])

    //get the necessary length of our miter
    return halfThick / vec.dot(miter, tmp)
}

function extrusions(positions, point, normal, scale) {
    //next two points to end our segment
    vec.scaleAndAdd(tmp, point, normal, -scale)
    positions.push(vec.clone(tmp))

    vec.scaleAndAdd(tmp, point, normal, scale)
    positions.push(vec.clone(tmp))
}

function normal(out, dir) {
    //get perpendicular
    vec.set(out, -dir[1], dir[0])
    return out
}

function direction(out, a, b) {
    //get unit dir of two lines
    vec.subtract(out, a, b)
    vec.normalize(out, out)
    return out
}

Stroke.prototype.path = function(points) {
    if (points.length <= 1)
        return

    var cells = this.cells
    var positions = this.positions
    var halfThick = this.thickness / 2
    var total = points.length

    this._lastFlip = -1
    this._started = false
    this._normal = null

    //join each segment
    for (var i=1, count=0; i<total; i++) {
        var last = points[i-1]
        var cur = points[i]
        var next = i<points.length-1 ? points[i+1] : null

        var amt = this._seg(count, last, cur, next)
        count += amt
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