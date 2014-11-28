# extrude-polyline

[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

![img](http://i.imgur.com/LGKsTj2.png)

Extrudes a 2D polyline with a given line thickness and the desired join/cap types. Tries to maintain visual consistency with HTML5 2D context stroking.

```js
var polylne = [ [25, 25], [15, 60] ]
var stroke = require('extrude-polyline')({ 
    thickness: 20, 
    cap: 'square',
    join: 'bevel',
    miterLimit: 10
})

//builds a triangulated mesh from a polyline
var mesh = stroke.build(polyline)
```

The returned mesh is a simplicial complex.

```js
{
    positions: [ [x,y], [x,y] ],
    cells: [ [a,b,c], [a,b,c] ]
}
```

## variable thickness

Currently, to achieve variable thickness you can provide a `mapThickness` function to the stroke instance before building. By default, it will simply return the current thickness.

```js
//create a falloff, so the thickness tapers toward the start of the path
stroke.mapThickness = function(point, index, points) {
    return this.thickness * index/(points.length-1)
}.bind(stroke)
```

## demo

Git clone, `npm install`, then `npm run test`

## Usage

[![NPM](https://nodei.co/npm/extrude-polyline.png)](https://nodei.co/npm/extrude-polyline/)

#### `stroke = Extrusion([opt])`

Creates a new path builder with the given settings:

- `thickness` the line thickness
- `miterLimit` the limit before miters turn into bevels; default 10
- `join` the join type, can be `'miter'` or `'bevel'` - default 'miter'
- `cap` the cap type, can be `'butt'` or `'square'` - defalut 'butt'

#### `mesh = stroke.build(points)`

Builds a stroke with the specified list of 2D points. Returns a simplicial complex.

## Roadmap

Some features that could be useful to add at a later point. PRs welcome.

- round corners
- round end caps
- use consistent winding order so we don't need to disable gl.CULLING
- connecting start and end points 
- optimizations for flat arrays (Float32Array) ? 
- optimizations for GC (pooling, etc)
- handling anti-aliasing
- degenerate triangles or some other form of supporting disconnected lines
- unify codebase with [polyline-normals](https://nodei.co/npm/polyline-normals/)

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/extrude-polyline/blob/master/LICENSE.md) for details.
