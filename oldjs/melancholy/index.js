window.onload = function() {
  //Math.seedrandom(5);
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.height = 500;
  ctx.canvas.width = 400;
  document.body.appendChild(ctx.canvas);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = ctx.strokeStyle = 'white';

  // Ground.
  const H = 400;
  {
    const fontsize = 20;
    const textpos = [30, 400];
    const grad = ctx.createLinearGradient(textpos[0], textpos[1] - fontsize + 5, ...textpos);
    ctx.font = `${fontsize}px "Roboto Mono", monospace`;
    grad.addColorStop(0, 'black');
    grad.addColorStop(1, 'white');
    ctx.fillStyle = grad;
    ctx.fillText("melancholy", ...textpos);
    let y = 0;
    const iid = setInterval(() => {
      ctx.fillRect(0, H, ctx.canvas.width, y);
      if ((y += 0.5) >= ctx.canvas.height - H + 1) clearInterval(iid);
    }, 0);
  }

  // Tree with animation.
  tree_anim(ctx, [200, H]);

  // Snow.
  setTimeout(_ => snow(ctx), 5000);


  ///////////////////////////////////////////////////////////////////////////


  // Tree w/o animation.
  function tree(ctx, startpos, depth = 5, offsx = 0, alpha = 1, offsy = 1) {
    if (depth-- <= 0) return;

    const OFFSET_X = 50;
    const OFFSET_Y = 10 * (depth + 1) * offsy;
    const dOFFSET_X = 20;
    const DEPTH_MAX = 5;

    const endpos = [
      startpos[0] + (Math.random() * OFFSET_X - OFFSET_X / 2 + offsx | 0),
      startpos[1] - (Math.random() * OFFSET_Y + OFFSET_Y / 2         | 0),
    ];

    ctx.lineWidth = alpha * 2;
    ctx.beginPath();
    ctx.moveTo(...startpos);
    ctx.lineTo(...endpos);
    ctx.stroke();

    tree(ctx, endpos, depth,                                 0, alpha / 1.5, 1.5);
    tree(ctx, endpos, depth, offsx - Math.random() * dOFFSET_X, alpha / 3.0, 1.0);
    tree(ctx, endpos, depth, offsx + Math.random() * dOFFSET_X, alpha / 3.0, 1.0);
  }


  // Tree with animation.
  function tree_anim(ctx, startpos, depth = 6, offsx = 0, alpha = 1, offsy = 1, time_to_grow = 20) {
    if (depth-- <= 0) return;

    const OFFSET_X = 50;
    const OFFSET_Y = 10 * (depth + 1) * offsy;
    const dOFFSET_X = 20;
    const DEPTH_MAX = 5;

    const endpos = [
      startpos[0] + (Math.random() * OFFSET_X - OFFSET_X / 2 + offsx | 0),
      startpos[1] - (Math.random() * OFFSET_Y + OFFSET_Y / 2         | 0),
    ];

    const dx = -(startpos[0] - endpos[0]) / time_to_grow;
    const dy = -(startpos[1] - endpos[1]) / time_to_grow;

    let counter = 0;
    const posacc = [...startpos];
    const iid = setInterval(() => {
      ctx.lineWidth = alpha * 2;
      ctx.beginPath();
      ctx.moveTo(...posacc);
      posacc[0] += dx;
      posacc[1] += dy;
      ctx.lineTo(...posacc);
      ctx.stroke();
      if (++counter >= time_to_grow) {
        clearInterval(iid);
        tree_anim(ctx, endpos, depth,                                 0, alpha / 1.5, 1.5, (time_to_grow * 1.5 | 0) || 1);
        tree_anim(ctx, endpos, depth, offsx - Math.random() * dOFFSET_X, alpha / 3.0, 1.0, (time_to_grow * 1.0 | 0) || 1);
        tree_anim(ctx, endpos, depth, offsx + Math.random() * dOFFSET_X, alpha / 3.0, 1.0, (time_to_grow * 1.0 | 0) || 1);
      }
    }, 20);
  }


  // Snow.
  function snow(ctx) {
    const sf_num = 100;
    const pattern_num = 20;
    const pattern_size = 7;

    const patterns = document.createElement('canvas');
    patterns.height = pattern_size;
    patterns.width = pattern_num * pattern_size;
    const pcontext = patterns.getContext('2d');

    for (let pi = 0; pi < pattern_num; ++pi) {
      const S = Math.random() * 2 + 3 | 0; // see pattern_size
      const I = (x,y) => S * y + x;
      const p = Array(S * S).fill(0);
      let pixelnum = 0;
      for (let y = 0; y < S >> 1; ++y)
        for (let x = 0; x < S >> 1; ++x)
          if (Math.random() > 0.5)
      {
        ++pixelnum;
        const c = Math.random() * 20 + 50;
        pcontext.fillStyle = `rgb(${c},${c},${c})`;
        pcontext.fillRect(pattern_size * pi +     x    ,     y    , 1, 1);
        pcontext.fillRect(pattern_size * pi + S - x - 1,     y    , 1, 1);
        pcontext.fillRect(pattern_size * pi +     x    , S - y - 1, 1, 1);
        pcontext.fillRect(pattern_size * pi + S - x - 1, S - y - 1, 1, 1);
      }
      if (pixelnum < 3) {
        pcontext.clearRect(pattern_size * pi, 0, pattern_size, pattern_size);
        --pi;
      }
    }

    const sfs = Array(sf_num).fill().map(_ => ({
      init(ctx) {
        this.index = Math.random() * pattern_num | 0;
        this.pos = [+Math.random() * ctx.canvas.width, -Math.random() * H];
        this.speed = [Math.random() * 4 - 2, Math.random() * 2].map(e => e / 4);
      },
      draw(ctx) {
        ctx.drawImage(patterns, this.index * pattern_size,               0, pattern_size, pattern_size,
                                          this.pos[0] | 0, this.pos[1] | 0, pattern_size, pattern_size);
        this.pos[0] += this.speed[0];
        if (this.pos[0] <    -pattern_size) this.pos[0] = ctx.canvas.width - pattern_size - 1;
        if (this.pos[0] > ctx.canvas.width) this.pos[0] = -pattern_size;
        this.pos[1] += this.speed[1];
        if (this.pos[1] > H - pattern_size) this.init(ctx);
      },
    }));

    const slayer = document.createElement('canvas');
    slayer.height = ctx.canvas.height;
    slayer.width = ctx.canvas.width;
    const scontext = slayer.getContext('2d');
    document.body.appendChild(slayer);

    sfs.forEach(e => e.init(scontext));
    setInterval(_ => {
      scontext.clearRect(0, 0, slayer.width, slayer.height);
      sfs.forEach(e => e.draw(scontext));
    }, 20);
  }
}
