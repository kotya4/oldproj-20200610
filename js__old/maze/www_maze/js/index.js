
function onload() {
  const ctx = U.canvas(600, 400);
  const depth = 1;  // pregenerated height of maze
  const rnum = 100; // radius (height)
  const anum = 200; // angles (width)
  const maze = Maze(rnum * depth, anum, 0);
  const or = 4;     // radius offset (from one circle to another in pixels)
  const oa = Math.PI * 2 / anum;
  const ox = ctx.canvas.width / 2 | 0;
  const oy = ctx.canvas.height / 2 | 0;
  let di = 0;       // depth index (height offset)
  let dr = 0;       // radius delta (for smooth translation between circles)
  let rs = 1;       // radius speed (in pixels)
  let rot = 0;      // rotation
  let rts = 0.001;  // rotation speed
  let maze_done = false;
  setInterval(() => {
    for (let i = 0; i < 100; ++i) maze.do_next(); // speed up generation
    if (!maze_done) maze_done = !maze.do_next(); // end up generation, start to rotate
    else {
      rot += rts;
      if ((dr -= rs) <= -or) {
        dr = 0;
        ++di;
      }
    }
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let ri = rnum - 1; ri > 1; --ri) {
      const r = ri * or;
      const alpha = r / (rnum * or) - 0.08;
      ctx.strokeStyle = `rgba(200,200,200,${alpha})`;  
      ctx.beginPath();
      for (let ai = 0; ai < anum; ++ai) {
        const current = maze.map[(ri + di) % maze.map.length][ai];
        if (current < 0) continue; // do not draw if that block is not generated yet.
        const a = oa * ai + rot;
        const [x1, y1] = U.cartesian(dr + r, a);
        const [x2, y2] = current
          ? U.cartesian(dr + r - or, a)
          : U.cartesian(dr + r, a + oa);
        ctx.moveTo(ox + x1, oy + y1);
        ctx.lineTo(ox + x2, oy + y2);
      }
      ctx.stroke();
    }
  }, 50);
}
((path, a) => {
  function loadjs(src, async = true) {
    return new Promise((res, rej) => 
      document.head.appendChild(Object.assign(document.createElement('script'), {
        src,
        async,
        onload: _ => res(src),
        onerror: _ => rej(src)
      }))
    )
  }
  Promise.all(a.map(e => loadjs(path + e)))
    .then(_ => window.addEventListener('load', onload))
    .catch(src => console.log(`File "${src}" not loaded`));
})
('www_maze/js/', [
  'utils.js',
  'maze.js',
]);
