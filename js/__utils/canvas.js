//
function canvas(width, height, parent) {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.height = height;
  ctx.canvas.width = width;
  (parent || document.body).appendChild(ctx.canvas);

  ctx.clear = function (color) {
    ctx.fillStyle = color || 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return null;
  }

  return ctx;
}
