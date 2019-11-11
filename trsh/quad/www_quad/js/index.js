window.onload = function () {
  const Noise = noise;


  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = 640;
  ctx.canvas.height = 360;
  document.body.appendChild(ctx.canvas);

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);


  function Snow(width, height, scaler, opt) {
    if (null == width || null == height) {
      throw Error(`Snow: width or height not provided`);
    }

    if (!scaler) scaler = 1;

    width = ~~(width / scaler);
    height = ~~(height / scaler);

    if (!opt) {
      opt = { };
    }

    if ('function' !== typeof opt.x) opt.x = _ => ~~(Math.random() * width);
    if ('function' !== typeof opt.y) opt.y = _ => -(~~(Math.random() * height));
    if ('function' !== typeof opt.fill) opt.fill = _ => {
      const c = ~~(Math.random() * 200) + 56;
      return `rgb(${c},${c},${c})`;
    }
    if ('function' !== typeof opt.stroke) opt.stroke = _ => null;

    if ('function' !== typeof opt.dx) opt.dx = _ => ~~(Math.random() * 3) - 1;
    if ('function' !== typeof opt.dy) opt.dy = _ => 1;

    const arr = [];

    function create() {
      const x = opt.x();
      const y = opt.y();
      const fill = opt.fill();
      const stroke = opt.stroke();
      return { x, y, fill, stroke };
    }

    function push() {
      arr.push(create());
    }

    function draw(ctx) {
      for (let a of arr) {
        if (a.x < 0 || a.x >= width || a.y < 0 || a.y >= height) continue;
        if (a.fill) {
          ctx.fillStyle = a.fill;
          ctx.fillRect(~~a.x * scaler, ~~a.y * scaler, scaler, scaler);
        }
        if (a.stroke) {
          ctx.strokeStyle = a.stroke;
          ctx.strokeRect(~~a.x * scaler, ~~a.y * scaler, scaler, scaler);
        }
      }
    }

    function move() {
      for (let i = 0; i < arr.length; ++i) {
        const dx = opt.dx();
        const dy = opt.dy();
        arr[i].x += dx;
        arr[i].y += dy;
        if (arr[i].x < -10 || arr[i].x >= width + 10 || arr[i].y >= height) {
          arr[i] = create();
        }
      }
    }

    return {
      push,
      draw,
      move,
    }
  }


  //const snow = Snow(ctx.canvas.width, ctx.canvas.height, 10);
  //for (let i = 0; i < 50; ++i) snow.push();

  const factor = 0.5;
  const scaler = 7;
  const width = 40;
  const height = 40;

  /*
  const map = [...Array(width)].map((_, x) => [...Array(height)].map((_, y) => 0));

  for (let x = 0; x < width; ++x) {
    for (let y = 0; y < height; ++y) {
      map[x][y] = Noise.perlin2(x * factor / 4, y * factor * 2) > 0;
    }
  }
  */

  let offx = 0;
  let offy = 0;
  let z = 0;
  let last_timestamp = 0;
  (function draw_frame(timestamp) {
    const elapsed = timestamp - last_timestamp;
    last_timestamp = timestamp;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let x = 0; x < width; ++x) {
      for (let y = 0; y < height; ++y) {
        if (Noise.perlin3((x + offx) / 3  , (y + offy) / 1, z) > 0) {
          ctx.fillStyle = 'white';
          ctx.fillRect(x * scaler, y * scaler, scaler, scaler);
        }
      }
    }

    if (timestamp % 100 < elapsed) {
      //z += 0.9;
      //offx += 1;
      //offy += 1;
    }

    ctx.fillStyle = 'white';
    ctx.fillText(`${~~elapsed}`, 20, 20);

    window.requestAnimationFrame(draw_frame);
  })();



  /*


  const factor = 0.5;
  let xfactor = factor;
  let yfactor = factor;
  let zfactor = 1; // factor;
  let z = 1;
  let max = 0;
  let min = 0xffff;
  let offx = 0;
  let offy = 0;
  setInterval(() => {
    const scaler = 10;
    for (let x = 0; x < ctx.canvas.width / scaler; ++x) {
      for (let y = 0; y < ctx.canvas.height / scaler; ++y) {
        const v = Noise.perlin2((offx + x) * xfactor, (offy + y) * yfactor);

        const v2 = Noise.perlin2((offx + x) * 0.01, (offy + y) * 0.01);

        let c = (1 + v) / 2 * 256;
        if (max < c) max = c;
        if (min > c) min = c;

        c = v > Math.abs(v2 * 2) ? c : 0;

        ctx.fillStyle = `rgb(${c},${c},${c})`;
        ctx.fillRect(x * scaler, y * scaler, scaler, scaler);
      }
    }
    //zfactor *= 0.1;
    offx += 1;
    offy += 1;
    ctx.font = '24px Roboto Mono';
    ctx.fillStyle = 'red';
    ctx.fillText(`min: ${min}`, 20, 20);
    ctx.fillText(`max: ${max}`, 20, 40);
  }, 100);
  */


}


