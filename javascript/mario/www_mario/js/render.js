function Render(parent, opt = {}) {
  let __draw = () => { throw Error(`Render: 'start' called without draw-function`); }

  ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = (opt.width || 640);
  ctx.canvas.height = (opt.height || 480);
  (parent || document.body).appendChild(ctx.canvas);
  clear();


  function sizes() {
    return {
      width: ctx.canvas.width,
      height: ctx.canvas.height,
    };
  }


  function clear(color = 'black') {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }


  function start(func, opt = {}) {
    // redefines draw-function if provided
    if (func) __draw = func;

    // parses options
    const clear_color = (opt.clear_color || 'black');
    const framerate = (opt.framerate || {});
    if (!framerate.color) framerate.color = 'white';
    if (!framerate.font) framerate.font = '20px "Arial"';
    if (!framerate.pos) framerate.pos = [1, 1 + parseInt(framerate.font)];

    // starts render
    let last_timestamp = 0;
    (function draw_frame(timestamp) {
      // calculates elapsed time
      const elapsed = timestamp - last_timestamp;
      last_timestamp = timestamp;

      // clears display
      clear(clear_color);

      // calls draw-function
      __draw(ctx, elapsed);

      // draws framerate
      ctx.font = framerate.font;
      ctx.fillStyle = framerate.color;
      ctx.fillText(~~elapsed, ...framerate.pos);

      // next frame
      window.requestAnimationFrame(draw_frame);
    })();

  }

  return {
    ctx,
    sizes,
    clear,
    start,
  }
}
