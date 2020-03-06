/*
 * This module written by sluchaynayakotya@gmail.com for
 * managing some matrix transformations in NeuralKotya.
 * Fully functional :3
 * Feb, 2019
 */

function mat(h, w) {
  const m = initialize(h, w);

  function initialize(h, w) {
    if (Number.isInteger(h) && Number.isInteger(w) && h > 0 && w > 0) return [...Array(h)].map(() => [...Array(w)]);
    if (h instanceof Array) return h[0] instanceof Array ? h.map(e => e.slice()) : h.map(e => [e]);
    if (h instanceof Function && 'array' in h) return h.array().map(e => e.slice());
    throw new Error('Arguments must be an array, integers or matrix object');
  }

  function get_err_str(a, str) {
    return `Cannot ${str} matrices ${m.length}x${m[0].length} and ${a.length}x${a[0].length}`;
  }

  function array() {
    return m;
  }

  function html_table(acc) {
    let s = '<table>';
    for (let y = 0; y < m.length; ++y) {
      s += '<tr>';
      for (let x = 0; x < m[0].length; ++x) {
        s += '<td>';
        let text = (m[y][x] > 0 ? '+' : '') + (acc ? ~~(m[y][x] * acc) / acc : m[y][x]);
        text += '0'.repeat(String(acc).length + 2 - text.length);
        s += text;
        s += '</td>';
      }
      s += '</tr>';
    }
    s += '</table>';
    return s;
  }

  function table() {
    console.table(m);
    return this;
  }

  function log() {
    console.log(m);
    return this;
  }

  function map(v) {
    const f = v instanceof Function ? v : () => v;
    return mat(m.map((_, i, a) => _.map((e, j) => f(e, i, j, a))));
  }

  function rand() {
    return mat(m.map(e => e.map(() => Math.random())));
  }

  function zip(a) {
    a = 'array' in a ? a.array() : a;
    if (a.length !== m.length) throw new Error(get_err_str(a, 'zip'));
    return mat(m.map((e, i) => e.concat(a[i])));
  }

  function mul(a) {
    a = 'array' in a ? a.array() : a;
    if (a.length !== m[0].length) throw new Error(get_err_str(a, 'multiply'));
    const new_a = [...Array(m.length)].map(() => Array(a[0].length));
    for (let r = 0; r < m.length; ++r) for (let c = 0; c < a[0].length; ++c) {
      new_a[r][c] = 0;
      for (let i = 0; i < m[0].length; ++i) new_a[r][c] += m[r][i] * a[i][c];
    }
    return mat(new_a);
  }

  function dot(a) {
    a = 'array' in a ? a.array() : a;
    if (a.length !== m.length || a[0].length !== m[0].length) throw new Error(get_err_str(a, 'dot'));
    return mat(m.map((e, i) => e.map((v, j) => v * a[i][j])));
  }

  function add(a) {
    a = 'array' in a ? a.array() : a;
    if (a.length !== m.length || a[0].length !== m[0].length) throw new Error(get_err_str(a, 'add'));
    return mat(m.map((e, i) => e.map((v, j) => v + a[i][j])));
  }

  function sub(a) {
    a = 'array' in a ? a.array() : a;
    if (a.length !== m.length || a[0].length !== m[0].length) throw new Error(get_err_str(a, 'substract'));
    return mat(m.map((e, i) => e.map((v, j) => v - a[i][j])));
  }

  function transpose() {
    return mat([...Array(m[0].length)].map((e, j) => [...Array(m.length)].map((e, i) => m[i][j])));
  }

  function float32Array() {
    const a = new Float32Array(m.length * m[0].length);
    for (let y = 0; y < m.length; ++y)
      for (let x = 0; x < m[0].length; ++x)
        a[x + y * m[0].length] = m[y][x];
    return a;
  }

  function gl_projection(fov, ratio, znear = 0.1, zfar = 100) {
    const pm11 = 1 / Math.tan(fov / 2);
    const pm00 = ratio * pm11;
    const pm22 = zfar / (zfar - znear);
    const pm32 = pm22 * (-znear);
    return mul([
      [pm00, 0, 0, 0],
      [0, pm11, 0, 0],
      [0, 0, pm22, 1],
      [0, 0, pm32, 0],
    ]);
  }

  function gl_rotate(rot, axis = 'x') {
    const s = Math.sin(rot);
    const c = Math.cos(rot);
    if (axis === 'x') return mul([
      [1,  0,  0, 0],
      [0, +c, +s, 0],
      [0, -s, +c, 0],
      [0,  0,  0, 1]
    ]);
    if (axis === 'y') return mul([
      [+c, 0, +s, 0],
      [ 0, 1,  0, 0],
      [-s, 0, +c, 0],
      [ 0, 0,  0, 1]
    ]);
    if (axis === 'z') throw new Error('not implemented yet');
    throw new Error('Second parameter has to be "x", "y" or "z"');
  }

  function gl_translate(x, y, z) {
    return mul([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [x, y, z, 1]
    ]);
  }

  return {
    sub,
    add,
    mul,
    zip,
    log,
    map,
    dot,
    rand,
    array,
    table,
    transpose,
    html_table,
    float32Array,
    gl_rotate,
    gl_translate,
    gl_projection,
  }
}

// -- static functions --

mat.create_gl_identity = () => {
  return mat([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ]);
}
