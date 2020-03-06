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
('www_sprite_gen/js/', [
  'perlin/perlin.js',
  'colors/colors.js'
]);

function onload() {
  const wrapper = document.getElementsByClassName('wrapper')[0];
  const cvs = document.createElement('canvas');
  cvs.width = 64;
  cvs.height = 64;
  wrapper.appendChild(cvs);
  const ctx = cvs.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = 'white';


  function create_canvas() {
    const cvs = document.createElement('canvas');
    cvs.width = 64;
    cvs.height = 64;
    const ctx = cvs.getContext('2d');
    return ctx;
  }

  const colors = Colors().shuffle().stringify().values;

  const perlin = Perlin({});


  const perlin_scale = 0.10;

  const alpha = 0.5;
  const radius_x = 64;
  const radius_y = 64;
  const color_shift = 0;

  function draw_perlin_noise({ ctx, alpha, z, radius_x, radius_y, color_shift, mirror_x, mirror_y, color_depth, perlin_scale }) {
    //ctx.fillStyle = 'black';
    //ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let y = 0; y < (mirror_y ? 32 : 64); ++y) {
      for (let x = 0; x < (mirror_x ? 32 : 64); ++x) {
        //const n = Math.random() * perlin_scale;
        const n = perlin.noise(x * perlin_scale, y * perlin_scale, z * perlin_scale);
        const rx = Math.abs(Math.sin(x / radius_x * Math.PI));
        const ry = Math.abs(Math.sin(y / radius_y * Math.PI));
        if (n * rx * ry > alpha) {
          ctx.fillStyle = colors[(n * color_depth + color_shift | 0) % colors.length];
          ctx.fillRect(x, y, 1, 1);
          if (mirror_x) ctx.fillRect(63 - x, y, 1, 1);
          if (mirror_y) {
            ctx.fillRect(x, 63 - y, 1, 1);
            if (mirror_x) ctx.fillRect(63 - x, 63 - y, 1, 1);
          }
        }
      }
    }
  }

  let z = 0;
  //setInterval(_ => draw_perlin_noise(++z), 100);


  const sprites = [];

  for (let i = 0; i < 1 + Math.random() * 5 | 0; ++i) {
    z = Math.random() * 100;

    const opt = {
      perlin_scale: Math.random() * 0.1,
      alpha: 0.1,
      radius_x: 64,
      radius_y: 64,
      color_shift: 0,//Math.random() * 100 | 0,
      color_depth: Math.random() * 5 | 0 + 2,
      z,
      mirror_x: true,//Math.random() > 0.1,
      mirror_y: false,//Math.random() > 0.5,
    };

    const tiles = [];
    for (let k = 0; k < 1 + Math.random() * 100 | 0; ++k) {
      const c = create_canvas();
      draw_perlin_noise(Object.assign(opt, { z: z + k, ctx: c }));
      tiles.push({
        c,
      });
    }

    const sprite = {
      tiles,
      current_tile: 0,
      timer: 1,
      time: 0,
      offx: 0,
      offy: 0,
      radx: Math.random() * 5 | 0,
      rady: Math.random() * 5 | 0,
    };

    sprites.push(sprite);
  }

  // draw
  setInterval(_ => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let s of sprites) {
      ctx.drawImage(s.tiles[s.current_tile].c.canvas, s.offx, s.offy);
      if (++s.time >= s.timer) {
        s.time = 0;
        s.current_tile = (s.current_tile + 1) % s.tiles.length;

        if (s.radx > 0) if (++s.offx >= s.radx) s.radx = -s.radx;
        if (s.radx < 0) if (--s.offx <= s.radx) s.radx = -s.radx;

        if (s.rady > 0) if (++s.offy >= s.rady) s.rady = -s.rady;
        if (s.rady < 0) if (--s.offy <= s.rady) s.rady = -s.rady;

      }
    }
  }, 100);
}
