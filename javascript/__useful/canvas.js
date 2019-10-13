function Canvas(w, h, parent) {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.height = h;
  ctx.canvas.width = w;
  (parent || document.body).appendChild(ctx.canvas);

  // adds custom function into context object
  ctx.clear = color => {
    if (typeof color === 'string') {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    } else {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }

  return ctx;
}
