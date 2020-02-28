
function Automata({ min, max, row, col, init }) {
  if (null == min) min = 1;
  if (null == max) max = 3;
  if (null == row) row = 21;
  if (null == col) col = 21;
  if (null == init) init = [[1]];

  const buffer1 = [...Array(col)].map(() => [...Array(row)]);
  const buffer2 = [...Array(col)].map(() => [...Array(row)]);
  let map = null;
  let buf = null;

  const initialize = () => {
    for (let y = 0; y < col; ++y) for (let x = 0; x < row; ++x) {
      buffer1[y][x] = 0;
      buffer2[y][x] = 0;
    }
    const oy = (col - init.length) >> 1;
    const ox = (row - init[0].length) >> 1;
    for (let y = 0; y < init.length; ++y) for (let x = 0; x < init[0].length; ++x) {
      buffer1[oy + y][ox + x] = init[y][x];
    }
    map = buffer1;
    buf = buffer2;
  }

  initialize();

  function proc(x, y) {
    let num = 0;
    for (let ox = 0; ox < 3; ++ox) for (let oy = 0; oy < 3; ++oy) {
      let _x = x - 1 + ox;
      let _y = y - 1 + oy;
      if (_x < 0) _x += row; else if (_x >= row) _x -= row;
      if (_y < 0) _y += col; else if (_y >= col) _y -= col;
      if (_x === x && _y === y) continue;
      num += map[_y][_x] ? 1 : 0;
    }
    buf[y][x] = num >= min && num <= max ? 1 : 0;
    return buf[y][x];
  }

  function swap() {
    if (map === buffer1) {
      map = buffer2;
      buf = buffer1;
    } else {
      map = buffer1;
      buf = buffer2;
    }
  }

  function dump() {
    return { min, max, row, col, init, map, buf }
  }

  return {
    proc,
    swap,
    dump,
  }
}



function Automata3d(rules, sizes, init) {
  let [min, max] = rules;
  let [row, col, dep] = sizes;
  if (null == min) min = 1;
  if (null == max) max = 3;
  if (null == row) row = 13;
  if (null == col) col = 13;
  if (null == dep) dep = 13;
  if (null == init) init = [[[1]]];
  /*
  if (null == init) init = [
    [[0, 1, 1], [1, 0, 1], [1, 1, 0]],
    [[1, 0, 1], [0, 0, 1], [0, 0, 1]],
    [[1, 0, 1], [1, 1, 0], [0, 1, 1]]
  ];
  */

  const buffer1 = [...Array(row)].map(() => [...Array(col)].map(() => [...Array(dep)]));
  const buffer2 = [...Array(row)].map(() => [...Array(col)].map(() => [...Array(dep)]));
  let map = null;
  let buf = null;

  const initialize = () => {
    for (let x = 0; x < row; ++x) for (let y = 0; y < col; ++y) for (let z = 0; z < dep; ++z) {
      buffer1[x][y][z] = 0;
      buffer2[x][y][z] = 0;
    }
    const w = init.length;
    const h = init[0].length;
    const d = init[0][0].length;
    const ox = (row - w) >> 1;
    const oy = (col - h) >> 1;
    const oz = (dep - d) >> 1;
    for (let x = 0; x < w; ++x) for (let y = 0; y < h; ++y) for (let z = 0; z < d; ++z) {
      buffer1[ox + x][oy + y][oz + z] = init[x][y][z];
    }
    map = buffer1;
    buf = buffer2;
  }

  initialize();

  function proc(x, y, z) {
    let num = 0;
    for (let ox = 0; ox < 3; ++ox) for (let oy = 0; oy < 3; ++oy) for (let oz = 0; oz < 3; ++oz) {
      let _x = x - 1 + ox;
      let _y = y - 1 + oy;
      let _z = z - 1 + oz;
      if (_x < 0) _x += row; else if (_x >= row) _x -= row;
      if (_y < 0) _y += col; else if (_y >= col) _y -= col;
      if (_z < 0) _z += dep; else if (_z >= dep) _z -= dep;
      if (_x === x && _y === y && _z === z) continue;
      num += map[_x][_y][_z] ? 1 : 0;
    }
    buf[x][y][z] = num >= min && num <= max ? 1 : 0;
    return buf[x][y][z];
  }

  function swap() {
    if (map === buffer1) {
      map = buffer2;
      buf = buffer1;
    } else {
      map = buffer1;
      buf = buffer2;
    }
  }

  function dump() {
    return { min, max, row, col, dep, init, map, buf }
  }

  function chunked(len = 10) {
    sizes = [0, 1]; // some random initial values
    let value = 2; // chunk value (must be greater than 1)
    const m = map.map(p => p.map(e => e.slice())); // copies map
    const w = m.length;
    const h = m[0].length;
    const d = m[0][0].length;
    const make_chunk = (x, y, z) => { // recursive chunk maker
      ++sizes[sizes.length - 1];
      //if (sizes[sizes.length - 1] > len) return;
      m[x][y][z] = value;
      const pos = [
        [x + 1, y    , z    ],
        [x - 1, y    , z    ],
        [x    , y + 1, z    ],
        [x    , y - 1, z    ],
        [x    , y    , z + 1],
        [x    , y    , z - 1],
      ].forEach(p => {
        if (p[0] < 0) p[0] += w; else if (p[0] >= w) p[0] -= w;
        if (p[1] < 0) p[1] += h; else if (p[1] >= h) p[1] -= h;
        if (p[2] < 0) p[2] += d; else if (p[2] >= d) p[2] -= d;
        if (m[p[0]][p[1]][p[2]] === 1) make_chunk(...p);
      });
    }
    // searches
    for (let x = 0; x < w; ++x) for (let y = 0; y < h; ++y) for (let z = 0; z < d; ++z)
      if (m[x][y][z] === 1) { // starts chunking
        sizes.push(0);
        make_chunk(x, y, z);
        ++value;
      }
    return {
      map: m,
      value,
      sizes,
    };
  }

  return {
    proc,
    swap,
    dump,
    chunked,
  }
}
