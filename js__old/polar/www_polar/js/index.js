
function onload() {

  function to_polar(x, y) {
    const r = Math.sqrt(x * x + y * y);
    const a = Math.atan2(y, x);
    return [r, a];
  }

  function to_cartesian(r, a) {
    const x = r * Math.cos(a);
    const y = r * Math.sin(a);
    return [x, y];
  }


  // -------------- IDONO BUT LOOKS COOL ----------------
  let a = 0;
  let c = `rgb(${Math.random() * 255 | 0},${Math.random() * 255 | 0},${Math.random() * 255 | 0})`;
  let rs = 2;
  const m = [
    '*   * ***** *     *     *****',
    '*   * *     *     *     *   *',
    '***** ***** *     *     *   *',
    '*   * *     *     *     *   *',
    '*   * ***** ***** ***** *****',
  ];
  function draw_circular_thing() {
    rs = Math.random() * 5;
    for(;;) {
      a += 0.1;
      //ctx.fillStyle = 'lightgrey';
      //ctx.fillRect(-ctx.canvas.width / 2, -ctx.canvas.height / 2, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = c; //'black';
      for (let y = 0; y < m.length; ++y)
        for (let x = 0; x < m[y].length; ++x)
          if (m[y][x] !== ' ') {
            let p = to_polar(x, y);
            let c = to_cartesian(p[0], p[1] + a);
            //console.log(c);
            ctx.fillRect(c[0] * rs | 0, c[1] * rs | 0, rs - 1, rs - 1);
            //ctx.fillRect(x * rs, y * rs, rs - 1, rs - 1);
          }
      if (a >= 2 * Math.PI) {
        a = a - 2 * Math.PI;
        c = `rgb(${Math.random() * 255 | 0},${Math.random() * 255 | 0},${Math.random() * 255 | 0})`;
        break;
      }
    }
  }

  // ----------- POLAR MAZE ---------------
  function draw_polar_maze(ctx, radius = 180, loops = 30, passes = 30, delta_pass = 0.3, delta_wall = 0.9, polar_position = [0, 0]) {
    //console.log(loops, passes, delta_pass, delta_wall);

    ctx.strokeStyle = 'white';
    ctx.translate(...to_cartesian(...polar_position));
    
    const da = Math.PI / passes;
    const dr = radius / loops;
    const lp = loops;
    
    ctx.beginPath();
    for (; loops--; ) {
      ctx.moveTo(...to_cartesian(radius, 0));
      for (let a = da; a < Math.PI * 2 + da; a += da) {

        if (Math.random() > delta_pass * (loops / lp)) {
          ctx.lineTo(...to_cartesian(radius, a));
          if (loops && Math.random() > delta_wall) {
            ctx.lineTo(...to_cartesian(radius - dr, a));
            ctx.moveTo(...to_cartesian(radius, a));
          }
        }
        else {
          ctx.moveTo(...to_cartesian(radius, a));
          if (loops) {
            ctx.lineTo(...to_cartesian(radius - dr, a));
            ctx.moveTo(...to_cartesian(radius, a));
          }
        }
      }
      radius -= dr;
    }
    ctx.stroke();
  }

  // --------------- DRAWING ----------------------
  const ctx = create_canvas(400, 400);
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);

  setInterval(() => {
    ctx.clearRect(-ctx.canvas.width / 2, -ctx.canvas.height / 2, ctx.canvas.width, ctx.canvas.height);
    //draw_circular_thing();
    draw_polar_maze(ctx, 180, rand(5, 30), rand(5, 30), Math.random(), Math.random());
  }, 100);
}

/*
 * Loader
 */
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
('www_polar/js/', [
  
]);

/*
 * Useful global functions 
 */
function sample(a) {
  return a[Math.random() * a.length | 0];
}
function alloc(size, fill = null) {
  return [...Array(size[0])].map(() =>  size.length > 1 
    ? alloc(size.slice(1, size.length), fill)
    : fill
  );
}
function last(a) {
  return a[a.length - 1];
}
function create_canvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'lightgrey';
  //ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  return ctx;
}
function rand(a, b) {
  if (a == null) return Math.random() * 0xffff | 0;
  if (b == null) return Math.random() * a | 0;
  return Math.random() * (b - a) + a | 0;

}