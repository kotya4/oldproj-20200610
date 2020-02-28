function Scene({ width, height, scale }) {

  const flg = {
    CONTINUE: 1,
  };

  const canvas = Object.assign(document.createElement('canvas'), {
    width,
    height
  });
  if (scale) {
    canvas.style.width = width * scale;
    canvas.style.height = height * scale;
  }
  const ctx = canvas.getContext('2d');
  document.body.appendChild(canvas);
  
  let fps = 0;
  let old_time = 0;
  let render_id = 0;
  let elapsed_time = 0;
  let _render = () => { throw new Error(`in scene render was started without callback`) }

  function render(time = 0) {
    elapsed_time += time - old_time;
    old_time = time;
    fps = 1000 / elapsed_time | 0;
    if (elapsed_time >= 15) {
      elapsed_time = 0;
      ctx.clearRect(0, 0, width, height);   
      if (_render({ ctx, fps, render_id }) !== flg.CONTINUE) return;
    }
    render_id = window.requestAnimationFrame(render);
  }

  function start_render(cb) {
    if (cb instanceof Function) _render = cb;
    render();
  }

  return Object.assign(flg, {
    start_render,
  });
}