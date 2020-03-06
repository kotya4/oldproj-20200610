
px.Canvas = function() {
  // timer ids
  const timer_ids = [];
  // fast canvas
  const cvs = document.getElementsByClassName('canvas')[1];
  const ctx = cvs.getContext('2d');
  // slow canvas
  const cvs_slow = document.getElementsByClassName('canvas')[0];
  const ctx_slow = cvs_slow.getContext('2d');
  // canvas sizes
  const width = 640;
  const height = 320;
  const scale = 0.5;
  const ratio = height / width;
  // some changing parameters
  let fps = 0;
  let old_time = 0;
  let elapsed_time = 0;
  let render_fast_id = 0;
  let render_slow_id = 0;
  // render function pointers
  let _render_fast = function(ctx, elapsed) { };
  let _render_slow = function(ctx, elapsed) { };

  // initializes fast canvas
  cvs.style.width = `${width}px`;
  cvs.style.height = `${height}px`;
  cvs.width = (width * scale) | 0;
  cvs.height = (cvs.width * ratio) | 0;
  ctx.imageSmoothingEnabled = false;

  // initializes slow canvsa
  cvs_slow.style.width = cvs.style.width;
  cvs_slow.style.height = cvs.style.height;
  cvs_slow.width = cvs.width;
  cvs_slow.height = cvs.height;
  ctx_slow.imageSmoothingEnabled = false;

  // starts render loop for fast functions
  function render_fast(time = 0) {
    elapsed_time += time - old_time | 0;
    old_time = time;
    fps = 1000 / elapsed_time | 0;
    if (elapsed_time >= 15) {
      elapsed_time = 0;
      const elapsed = 20;
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      _render_fast(ctx, elapsed);
    }
    render_fast_id = window.requestAnimationFrame(render_fast);
  }

  // starts render loop for slow functions
  function render_slow() {
    const ctx = ctx_slow;
    const cvs = cvs_slow;
    const elapsed = 200;
    render_slow_id = setInterval(() => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, cvs.width, cvs.height);
      _render_slow(ctx, elapsed);
    }, elapsed);
  }

  // some getters/setters
  this.get_fps = function() { return fps; }
  this.get_width = function() { return cvs.width; }
  this.get_height = function() { return cvs.height; }
  // sets render function pointers
  this.render_fast = function(f) { _render_fast = f; };
  this.render_slow = function(f) { _render_slow = f; };
  // executes render loops
  this.exec = function() {
    render_fast();
    render_slow();
  }
  // pauses render loops
  this.pause = function() {
    // TODO: 
  }
  // timer
  this.secs_between = function(t1 = null, t2 = null, id = null) {
    const t = old_time / 1000; // seconds
    const flg = t1 === null || t2 === null && t1 <= t || t1 <= t && t2 >= t;
    if (id !== null) {
      if (timer_ids.find(e => e === id) !== undefined)
        return false;
      else
        if (flg)
          timer_ids.push(id);
    }
    return flg;
  }
}