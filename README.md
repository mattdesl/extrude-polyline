# meshify-stroke

[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

Takes a 2D polyline and a line thickness, then produces a triangulated and indexed mesh. 


```js
[ [25, 25], [15, 60] ]

```

FEATURES:

- miter join
- bevel join
- square/butt end caps

TODO:

- round corners
- round end caps
- fix case where normal is reversed
- ensure winding order does not lead to culling
- connecting start + end points without a cap
- optimizations for flat Float32Array ? 
- how to handle anti-aliasing? surround mesh?


## Usage

[![NPM](https://nodei.co/npm/meshify-stroke.png)](https://nodei.co/npm/meshify-stroke/)

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/meshify-stroke/blob/master/LICENSE.md) for details.
