function Mouse(parent) {
  if (!parent) throw Error(`Mouse: 'parent' not provided`);
  let __listen = () => { }

  const mouse = {
    x: Infinity,
    y: Infinity,
    is_left_down: false,
    is_right_down: false,
    listen(func) { __listen = func; },

    draw(ctx) {
      ctx.fillStyle = 'yellow';
      ctx.beginPath();
      ctx.arc(this.x, this.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    },
  };

  window.addEventListener('mousedown', event => {
    if (event.which === 1) mouse.is_left_down = true;
    if (event.which === 3) mouse.is_right_down = true;
    __listen(event);
  });

  window.addEventListener('mouseup', event => {
    if (event.which === 1) mouse.is_left_down = false;
    if (event.which === 3) mouse.is_right_down = false;
    __listen(event);
  });

  window.addEventListener('mousemove', event => {
    const rect = parent.getBoundingClientRect();
    mouse.x = ~~(event.clientX - rect.x);
    mouse.y = ~~(event.clientY - rect.y);
    __listen(event);
  });

  window.addEventListener('contextmenu', event => {
    event.preventDefault();
    return false;
  });

  return mouse;
}
