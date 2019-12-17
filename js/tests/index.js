window.onload = function() {

  //Math.seedrandom(1);

  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.height = 600;
  ctx.canvas.width = 600;
  document.body.appendChild(ctx.canvas);

  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Init.

  const rects = [];

  rects.draw = function (sts = 4) {
    for (let r of rects) {
      if ('prey' in r) continue;
      ctx.strokeStyle = ctx.fillStyle = `rgb(${r.color})`;
      ctx.strokeRect(r[0] + sts, r[1] + sts, r[2] - sts * 2, r[3] - sts * 2);
      ctx.fillText(r.index, r[0] + sts + 5, r[1] + sts + 14);
    }
  }

  // Randomizes sizes of rows and columns, but saves geometry.

  function normarr(num = 1, min = 0, max = 1) {
    let out = Array(num).fill().map(_ => min + Math.random() * (max - min));
    const sum = out.reduce((a,c) => a + c, 0);
    out = out.map(e => e / sum);
    return out;
  }

  const qs = 300;
  const rs = 60;
  const rn = qs / rs;
  const rowsizes = normarr(rn, 0.7).map(e => e * qs);
  const colsizes = normarr(rn, 0.7).map(e => e * qs);

  let i = 0;
  let rpy = 0;
  for (let y = 0; y < rn; ++y) {
    const rys = rowsizes[y];
    let rpx = 0;
    for (let x = 0; x < rn; ++x) {
      const rxs = colsizes[x];
      rects.push([rpx, rpy, rxs, rys]);
      rects[rects.length - 1].index = i;
      rects[rects.length - 1].color = Array(3).fill()
        .map(_ => 100 + Math.random() * 156 | 0);
      i++;
      rpx += rxs;
    }
    rpy += rys;
  }

  // Breaks geometry by removing some rectangles and resizing neighbours.

  const min = 0.2; // separator layes between ...
  const max = 0.8;
  const w = rn;
  const h = rn;
  const I = (x, y) => (x < 0 || x >= w || y < 0 || y >= h) ? -1 : (x + y * w);

  function absorb(_i, _m, _p, rk, rj, sym) { // ... magic fuck yeah!
    if (!('prey' in rects[_i] || 'eater' in rects[_i]
    ||    'prey' in rects[_m] || 'eater' in rects[_m]
    ||    'prey' in rects[_p] || 'eater' in rects[_p]))
    {
      const n = min + Math.random() * (max - min) * rects[_i][rk];
      rects[_m][rk] += n;
      rects[_p][rj] = rects[_i][rj] + n;
      rects[_p][rk] += rects[_i][rk] - n;
      rects[_i].prey = sym[0];
      rects[_m].eater = sym[1];
      rects[_p].eater = sym[2];
      rects[_i].prey_TL = rects[_m];
      rects[_i].prey_BR = rects[_p];
    }
  }

  for (let y = 0; y < rn; ++y)
    for (let x = 0; x < rn; ++x)
  {
    /**/ if (!(x < 1 || x >= w - 1) && Math.random() < 0.5)
      absorb(I(x, y), I(x - 1, y), I(x + 1, y), 2, 0, 'HLR');
    else if (!(y < 1 || y >= h - 1))
      absorb(I(x, y), I(x, y - 1), I(x, y + 1), 3, 1, 'VTB');
  }

  // Calculates gaps.

  for (let y = 0; y < rn; ++y)
    for (let x = 0; x < rn; ++x)
  {
    // neighbours
    const neI = [ I(x - 1, y - 1), I(x + 0, y - 1), I(x + 1, y - 1),
                  I(x - 1, y    ), I(x    , y    ), I(x + 1, y    ),
                  I(x - 1, y + 1), I(x + 0, y + 1), I(x + 1, y + 1), ];
    const neR =


  }



  // Draw.

  ctx.translate(150, 150);
  ctx.lineWidth = 2;
  rects.draw(6);

  ctx.translate(-150, -150);
  for (let y = 0; y < rn; ++y)
    for (let x = 0; x < rn; ++x)
  {
    if ('prey' in rects[x + y * rn] === false) {
      ctx.strokeStyle = ctx.fillStyle = `rgb(${rects[x + y * rn].color})`;
      ctx.fillRect(x * 20, y * 20, 20, 20);
      if ('eater' in rects[x + y * rn]) {
        ctx.fillStyle = 'black';
        ctx.fillText(rects[x + y * rn].eater, x * 20 + 5, y * 20 + 14);
      }
    } else {
      ctx.fillStyle = 'white';
      ctx.fillText(rects[x + y * rn].prey, x * 20 + 5, y * 20 + 14);
    }
  }
}
