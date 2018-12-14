/* eslint-disable no-unused-vars */
import React from 'react';
import { __, add, addIndex, map, range, scan, slice, subtract, sum, zip } from 'ramda';
import { pantone } from 'blee';

const { E: 𝑒, PI: 𝜋 } = Math;
const 𝜙 = 1.618033988749895;
const { cos, sin, tan } = Math;
const [ sec, csc, cot ] = map(f => θ => 1/f(θ))([cos, sin, tan]);

const mapIndexed = addIndex(map)

function * cycle(iterable) { while (true) yield * iterable; }
function * chain(...iterables) { for (const iterable of iterables) yield * iterable; }

const scalingFactor = 𝜙;
//const scalingFactor = 1.57; // for iPhone X case
const limit = 5;

//const widths = map(exponent => scalingFactor**exponent, range(0, limit));
const widths = [1, 2, 3, 5, 8];

const mat = (widths, dimensions = {}, shape = 'rect') => {
  const normedDimensions = map(subtract(__, 1))(dimensions);
  const [expandTop, expandBottom, expandLeft, expandRight] = map(({key, fallback}) => {
    if (normedDimensions[key] != null) return normedDimensions[key];
    if (normedDimensions[fallback] != null) return normedDimensions[fallback] / 2;
    if (normedDimensions.expand != null) return normedDimensions.expand / 2;
    return 0;
  })([
    {key: 'expandTop',    fallback: 'expandVertical'},
    {key: 'expandBottom', fallback: 'expandVertical'},
    {key: 'expandLeft',   fallback: 'expandHorizontal'},
    {key: 'expandRight',  fallback: 'expandHorizontal'}
  ]);

  // we hard-code two assumptions about the logo:
  //   * all angles are at 45 degrees / 𝜋/4 radians, so we can use cos
  //     and sin interchangeably to determinate the radius
  //   * the logo contains four visible stripes, although we can choose
  //     to draw more by adjusting the "limit" variable if we want to
  //     open up the mat.
  const radius = cos(𝜋/4) * sum(slice(0, 4, widths));
  const diameter = 2 * radius;

  const x = -radius - diameter * expandLeft;
  const y = -radius - diameter * expandTop;
  const width = diameter * (1 + expandLeft + expandRight);
  const height = diameter * (1 + expandTop + expandBottom);

  const viewBox = [x, y, width, height].join(' ');
  const clipPath = shape === 'ellipse'
    ? <ellipse cx={x + width / 2} cy={y + height / 2} rx={width / 2} ry={height / 2} />
    : <rect x={x} y={y} width={width} height={height} />
  return {viewBox, clipPath};
};

const even = n => n % 2 === 0;
const inradius = sum(widths);
const circumradius = 2 * inradius;
const drawStripes = (i, width, offset, styles) => <React.Fragment key={i}>
  <rect key="top_right"
        x={-(offset + width)}
        y={-inradius}
        width={width}
        height={inradius}
        style={styles.next().value} />
  <rect key="left"
        x={-inradius}
        y={offset}
        width={inradius}
        height={width}
        style={styles.next().value} />
  <rect key="bottom"
        x={offset}
        y={-inradius}
        width={width}
        height={circumradius}
        style={styles.next().value} />
</React.Fragment>

const palettes = {
  patreon: {
    orange: '#E7471E',
    coral: '#F96854',
    navy: '#052D49'
  },
  leap: {
    green: '#5DAA00'
  },
  looker: {
    purple: '#5a2fc2'
  }
}

function * alternateStripes(colors) {
  while (true) {
    yield {fill: colors.next().value}
    yield {display: 'none'};
    yield {display: 'none'};
    yield {display: 'none'};
    yield {fill: colors.next().value}
    yield {fill: colors.next().value}
  }
}

const styles = {
  black: alternateStripes(cycle(['black'])),
  leap: alternateStripes(cycle([palettes.leap.green])),
  looker: alternateStripes(cycle([palettes.looker.purple]))
}

export default ({palette}) => {
  const {viewBox, clipPath} = mat(widths/*, {expand: sec(π/4)} */);
  const offsets = scan(add, 0, widths);
  return (
    <svg xmlns="http://www.w3.org/2000/svg"
         viewBox={viewBox} >
      <defs>
        <clipPath id="clip-path">
          {clipPath}
        </clipPath>
      </defs>
      <g clipPath="url(#clip-path)">
        <g transform="rotate(-45)">
          {mapIndexed(
            ([width, offset], i) => drawStripes(i, width, offset, styles[palette]),
            zip(widths, offsets)
          )}
        </g>
      </g>
    </svg>
  );
}
