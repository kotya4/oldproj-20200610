
px.Platform = function(_x1, _x2, h, args = {}) {
  function arg(key, def) {
    if (key in args) return args[key];
    else if (undefined !== def) return def;
    throw(`Argument has no default value for key '${key}'.`);
  }

  const x1 = _x1 < _x2 ? _x1 : _x2;
  const x2 = _x1 < _x2 ? _x2 : _x1;
  const transparent = arg('transparent', false);
  const ceiling = arg('ceiling', false);

  const colors = [ '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#c0c0c0', ];

  function is_near_by(x, y, size) {
    if (x > x1 - size && x < x2)
      if (y > h && y - size < h)
        return true;
    return false;
  }

  function is_near_by_ceiling(x, y, size, from_what_side) {
    if (ceiling && x > x1 - size && x < x2) {
      if (from_what_side < 0 && y > h && y - size < h) // from down
        return true;
    }
    return false;
  }

  function draw(ctx) {
    if (transparent) return;
    ctx.strokeStyle = 'white';//colors[Math.random() * colors.length | 0];
    ctx.beginPath();
    ctx.moveTo(x1, h);
    ctx.lineTo(x2, h);
    ctx.stroke();
  }

  this.is_near_by_ceiling = is_near_by_ceiling;
  this.is_near_by = is_near_by;
  this.draw = draw;
  this.height = h;
}