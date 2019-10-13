//
window.onload = async () => {
  const screen_height = 1300;
  const screen_width = 1640;

  const ctx = document.createElement('canvas').getContext('2d');
  document.body.appendChild(ctx.canvas);
  ctx.canvas.height = screen_height;
  ctx.canvas.width = screen_width;

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // зеленые случайные символы на экране - это радиация


}
