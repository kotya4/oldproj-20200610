function Mouse(ctx) {
  const mouse = {
    x: 0,
    y: 0,
    draw(ctx) {
      ctx.fillStyle = 'yellow';
      ctx.beginPath();
      ctx.arc(this.x, this.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    },
  };

  window.addEventListener('mousemove', event => {
    const rect = ctx.canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  });

  return mouse;
}
