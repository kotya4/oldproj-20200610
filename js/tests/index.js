window.onload = function() {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.height = 300;
  ctx.canvas.width = 300;
  document.body.appendChild(ctx.canvas);
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const width = 2;
  const height = 2;
  let RADIUS = 20;
  const ROFFSET = () => RADIUS * 1.2;
  const XOFFSET = () => (ctx.canvas.width - ROFFSET() * width) / 2;
  const YOFFSET = () => (ctx.canvas.height - ROFFSET() * height) / 2;


  function draw_circle(x, y) {
    const R1 = R2 = RADIUS;
    const ROT = 0, SANG = 0, EANG = Math.PI * 2, ANTI = false;
    const GRDX = RADIUS / 2, GRDY = RADIUS / 2;
    const SHADX = x + 10, SHADY = y + 10;



    ctx.fillStyle = ctx.createRadialGradient(SHADX, SHADY, RADIUS, SHADX - RADIUS / 4, SHADY - RADIUS / 8, RADIUS / 4);
    ctx.fillStyle.addColorStop(0, 'transparent');
    ctx.fillStyle.addColorStop(1, 'black');
    ctx.beginPath();
    ctx.ellipse(SHADX, SHADY, R1, R2, ROT, SANG, EANG, ANTI);
    ctx.fill();



    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillStyle = ctx.createRadialGradient(x - GRDX, y - GRDY, RADIUS, x - RADIUS / 4 - GRDX, y - RADIUS / 8 - GRDY, RADIUS / 4);
    ctx.fillStyle.addColorStop(0, '#666');
    ctx.fillStyle.addColorStop(1, 'white');
    ctx.beginPath();
    ctx.ellipse(x, y, R1, R2, ROT, SANG, EANG, ANTI);
    ctx.fill();
  }


  const circles = [];
  const initiated = [];
  const num = width * height;
  const XY = index => [index%width, index/width|0];

  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      let random_index = Math.random() * num | 0;
      for (let INF = 0; INF < num; ++INF) {
        if (initiated[random_index]) random_index = (random_index + 1) % num; else break;
      }
      initiated[random_index] = true;
      const DX = Math.random() * RADIUS / 2;
      const DY = Math.random() * RADIUS / 2;
      circles.push([...XY(random_index), DX, DY]);
    }
  }





  // ctx.translate(+ctx.canvas.width / 2, +ctx.canvas.height / 2);
  const iid = setInterval(draw_all_circles, 10);




  function draw_all_circles() {
    // ctx.fillStyle = 'black';
    // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let c of circles) {
      const x = XOFFSET() + c[0] * ROFFSET() + c[2] | 0;
      const y = YOFFSET() + c[1] * ROFFSET() + c[3] | 0;
      draw_circle(x, y);
      if (x > 0 + RADIUS * 2 && x < ctx.canvas.width - RADIUS * 2) c[0] += (Math.random() * 2 - 1) * 1;
      if (y > 0 + RADIUS * 2 && y < ctx.canvas.height - RADIUS * 2) c[1] += (Math.random() * 2 - 1) * 1;

    }

    RADIUS = RADIUS - 0.1;
    if (RADIUS <= 0) clearInterval(iid);
  }



}
