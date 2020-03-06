
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
