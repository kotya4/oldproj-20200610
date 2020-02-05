window.onload = function() {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.height = 400;
  ctx.canvas.width = 600;
  document.body.appendChild(ctx.canvas);
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const rg = RoomGenerator(8, 1, 0.2, 0.8, 0.6, 0.9, new Math.seedrandom('myseed'));

  rg.draw(ctx);
  ctx.translate(350, 0);
  rg.draw_scheme(ctx);
}
