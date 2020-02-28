
px.Wall = function(w, _y1, _y2, args = {}) {
  function arg(key, def) {
    if (key in args) return args[key];
    else if (undefined !== def) return def;
    throw(`Argument has no default value for key '${key}'.`);
  }

  const y1 = _y1 < _y2 ? _y1 : _y2;
  const y2 = _y1 < _y2 ? _y2 : _y1;
  const transparent = arg('transparent', false);

  const colors = [ '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#c0c0c0', ];

  function is_near_by(x, y, size, from_what_side) {
    if (y >= y1 && y <= y2) {
      if (x < w && x + size > w)
          return true;

      if (from_what_side > 0) { // from left
        if (x < w && x + size + size / 2 > w)
          return true;
      } else { // from right
        if (x - size / 2 < w && x + size > w)
          return true;
      }
    }
    return false;
  }

  function draw(ctx) {
    if (transparent) return;
    ctx.strokeStyle = colors[Math.random() * colors.length | 0];
    ctx.beginPath();
    ctx.moveTo(w, y1);
    ctx.lineTo(w, y2);
    ctx.stroke();
  }

  this.is_near_by = is_near_by;
  this.width = w;
  this.draw = draw;
}