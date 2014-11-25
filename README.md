# extrude-polyline

[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

Extrudes a 2D polyline with a given line thickness and the desired join/cap types. Tries to maintain visual consistency with HTML5 2D context stroking.

```js
var polylne = [ [25, 25], [15, 60] ]
var stroke = require('extrude-polyline')({ 
    thickness: 20, 
    cap: 'square',
    join: 'miter',
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



## Usage

[![NPM](https://nodei.co/npm/extrude-polyline.png)](https://nodei.co/npm/extrude-polyline/)

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


## License

MIT, see [LICENSE.md](http://github.com/mattdesl/extrude-polyline/blob/master/LICENSE.md) for details.
