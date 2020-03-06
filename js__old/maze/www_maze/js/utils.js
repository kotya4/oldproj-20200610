
const U = {};


U.sample = function (a) {
  return a[Math.random() * a.length | 0];
}


U.alloc = function (size, fill = null) {
  return [...Array(size[0])].map(() => size.length > 1 
    ? U.alloc(size.slice(1, size.length), fill)
    : fill
  );
}


U.last = function (a) {
  return a[a.length - 1];
}


U.canvas = function (width, height, color) {
  const ctx = document.body
    .appendChild(document.createElement('canvas')
      .assign({}, { width, height }))
    .getContext('2d');
  if (color != null) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, width);
  }
  return ctx;
}


U.rand = function (a, b) {
  if (a == null) return Math.random() * 0xffff | 0;
  if (b == null) return Math.random() * a | 0;
  return Math.random() * (b - a) + a | 0;
}


U.shuffle = function (a) {
  for (let i = a.length - 1; i > 0; --i) {
    const j = Math.random() * (i + 1) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


U.shuffle_with_chance = function (a, chance) {
  const indices = a.map((e,i) => i);
  const arr = [];
  do {
    let sum = 0;
    for (let i = 0; i < indices.length; ++i) sum += chance[indices[i]];
    const r = Math.random() * sum
    let acc = 0;
    for (let i = 0; i < indices.length; ++i) {
      if (acc <= r && r < acc + chance[indices[i]]) {
        arr.push(a[indices[i]]);
        sum -= chance[indices[i]];
        indices[i] = indices[indices.length - 1];
        indices.pop();
        break;
      }
      acc += chance[indices[i]];
    }
  } while(indices.length);
  return arr;
}


U.polar = function (x, y) {
  const r = Math.sqrt(x * x + y * y);
  const a = Math.atan2(y, x);
  return [r, a];
}


U.cartesian = function (r, a) {
  const x = r * Math.cos(a);
  const y = r * Math.sin(a);
  return [x, y];
}
