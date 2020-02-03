window.onload = function() {

  Math.seedrandom(5);

  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.height = 600;
  ctx.canvas.width = 600;
  document.body.appendChild(ctx.canvas);

  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Init.

  // x, y, w, h
  const rects = [];

  function draw_gap(e, a) {
    ctx.strokeStyle = `rgb(${Array(3).fill().map(_ => 50 + Math.random() * 206 | 0)})`;
    ctx.beginPath();
    ctx.moveTo(e[0] + a[0], e[1] + a[1]);
    ctx.lineTo(e[2] + a[2], e[3] + a[3]);
    ctx.stroke();
  }

  rects.draw = function (sts = 4) {
    for (let r of rects) {
      if ('gaps' in r) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = ctx.fillStyle = `rgb(${r.color})`;
        ctx.fillText(r.index, r[0] + sts + 5, r[1] + sts + 14);
        r.gaps.T.forEach(e => draw_gap(e, [+sts, -sts, -sts, -sts]));
        r.gaps.L.forEach(e => draw_gap(e, [-sts, +sts, -sts, -sts]));
        r.gaps.R.forEach(e => draw_gap(e, [+sts, +sts, +sts, -sts]));
        r.gaps.B.forEach(e => draw_gap(e, [+sts, +sts, -sts, +sts]));
        //ctx.strokeRect(r[0] + sts, r[1] + sts, r[2] - sts * 2, r[3] - sts * 2);
      }
    }
  }

  // rects.draw = function (sts = 4) {
  //   for (let r of rects) {
  //     if ('is_prey' in r) continue;
  //     ctx.strokeStyle = ctx.fillStyle = `rgb(${r.color})`;
  //     ctx.strokeRect(r[0] + sts, r[1] + sts, r[2] - sts * 2, r[3] - sts * 2);
  //     ctx.fillText(r.index, r[0] + sts + 5, r[1] + sts + 14);
  //   }
  // }

  // Randomizes sizes of rows and columns, but saves geometry.

  function normarr(num = 1, min = 0, max = 1) {
    let out = Array(num).fill().map(_ => min + Math.random() * (max - min));
    const sum = out.reduce((a,c) => a + c, 0);
    out = out.map(e => e / sum);
    return out;
  }

  const qs = 240; // quad size ?
  const rs = 60;  // rect size ?
  const rn = qs / rs; // rects number
  const rowsizes = normarr(rn, 0.7, 1.0).map(e => e * qs);
  const colsizes = normarr(rn, 0.7, 1.0).map(e => e * qs);

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

  const min = 0.2; // separator layes between ... (infimum)
  const max = 0.8;
  const w = rn;
  const h = rn;
  const I = (x, y) => (x < 0 || x >= w || y < 0 || y >= h) ? -1 : (x + y * w);

  function absorb(_i, _m, _p, rk, rj, sym) { // ... magic fuck yeah!
    if (!('is_prey' in rects[_i] || 'is_eater' in rects[_i]
    ||    'is_prey' in rects[_m] || 'is_eater' in rects[_m]
    ||    'is_prey' in rects[_p] || 'is_eater' in rects[_p]))
    {
      const n = min + Math.random() * (max - min) * rects[_i][rk];
      rects[_m][rk] += n;
      rects[_p][rj] = rects[_i][rj] + n;
      rects[_p][rk] += rects[_i][rk] - n;
      rects[_i].is_prey = sym[0];
      rects[_i].prey_TL = rects[_m];
      rects[_i].prey_BR = rects[_p];
      rects[_m].is_eater = sym[1];
      rects[_p].is_eater = sym[2];
    }
  }

  for (let y = 0; y < rn; ++y)
    for (let x = 0; x < rn; ++x)
  {
    if (Math.random() < 0.5 && !(x < 1 || x >= w - 1))
      absorb(I(x, y), I(x - 1, y), I(x + 1, y), 2, 0, 'HLR');
    else if (                  !(y < 1 || y >= h - 1))
      absorb(I(x, y), I(x, y - 1), I(x, y + 1), 3, 1, 'VTB');
  }

  // Calculates gaps.

  function push_gap(key, r, C, a, b, di) {
    const d = C[di] - r[di];
    const F = d < 0;
    const v = F ? (C[2 + di] + d) : (r[2 + di] - d);
    let x1, y1, x2, y2;
    x1 = C[0] + C[2] * a[0 + 4 * +F] + v * b[0 + 4 * +F];
    y1 = C[1] + C[3] * a[1 + 4 * +F] + v * b[1 + 4 * +F];
    x2 = C[0] + C[2] * a[2 + 4 * +F] + v * b[2 + 4 * +F];
    y2 = C[1] + C[3] * a[3 + 4 * +F] + v * b[3 + 4 * +F];
    if (di) { (y2 - y1 > C[3]) && (y2 = y1 + C[3]) }
    else    { (x2 - x1 > C[2]) && (x2 = x1 + C[2]) }
    const g = [x1, y1, x2, y2];
    (C.gaps[key].some(e => e.every((e,i) => e === g[i]))) || C.gaps[key].push(g);
  }

  for (let y = 0; y < rn; ++y)
    for (let x = 0; x < rn; ++x)
  {
    if (rects[I(x, y)].is_prey) continue; // skip if is a prey

    // neighbours
    const names = ['TL', 'TM', 'TR', 'ML', 'MM', 'MR', 'BL', 'BM', 'BR'];
    const indices = [ I(x - 1, y - 1), I(x + 0, y - 1), I(x + 1, y - 1),
                      I(x - 1, y    ), I(x    , y    ), I(x + 1, y    ),
                      I(x - 1, y + 1), I(x + 0, y + 1), I(x + 1, y + 1), ];
    const C = rects[indices[4]]; // current rect
    // creating dictionary R replacing all preys with eaters (greedy)
    const R = {};
    for (let i = 0; i < names.length; ++i) {
      const r = rects[indices[i]];
      const a = (R[names[i]] = []);
      if (!r        ) {            continue; } // if no rect in this index, skip
      if (!r.is_prey) { a.push(r); continue; } // if is a not prey, push itself
      a.push(r.prey_TL, r.prey_BR);            // if is a prey, push eaters instead
    }

    const tops = new Set([...R.TM]);
    R.TL.forEach(r => (r[0] + r[2] > C[0]) && tops.add(r));
    R.TR.forEach(r => (r[0] < C[0] + C[2]) && tops.add(r));

    const bottoms = new Set([...R.BM]);
    R.BL.forEach(r => (r[0] + r[2] > C[0]) && bottoms.add(r));
    R.BR.forEach(r => (r[0] < C[0] + C[2]) && bottoms.add(r));

    const lefts = new Set([...R.ML]);
    R.TL.forEach(r => (r[1] + r[3] > C[1]) && lefts.add(r));
    R.BL.forEach(r => (r[1] < C[1] + C[3]) && lefts.add(r));

    const rights = new Set([...R.MR]);
    R.TR.forEach(r => (r[1] + r[3] > C[1]) && rights.add(r));
    R.BR.forEach(r => (r[1] < C[1] + C[3]) && rights.add(r));

    // each gap contain gap-line (part of wall where gap can be placed)
    // (wall is a border if length = 0).
    C.gaps = { T:[], L:[], R:[], B:[] };
    tops.forEach   (r => push_gap('T', r, C, [0, 0, 0, 0, 1, 0, 1, 0], [0, 0, 1, 0, -1, 0, 0, 0], 0));
    lefts.forEach  (r => push_gap('L', r, C, [0, 0, 0, 0, 0, 1, 0, 1], [0, 0, 0, 1, 0, -1, 0, 0], 1));
    rights.forEach (r => push_gap('R', r, C, [1, 0, 1, 0, 1, 1, 1, 1], [0, 0, 0, 1, 0, -1, 0, 0], 1));
    bottoms.forEach(r => push_gap('B', r, C, [0, 1, 0, 1, 1, 1, 1, 1], [0, 0, 1, 0, -1, 0, 0, 0], 0));
  }











  // Draw.

  const gap_size = 6;

  ctx.translate(150, 150);
  ctx.lineWidth = 2;
  rects.draw(gap_size);

  ctx.translate(-150, -150);
  for (let y = 0; y < rn; ++y)
    for (let x = 0; x < rn; ++x)
  {
    if ('is_prey' in rects[x + y * rn] === false) {
      ctx.strokeStyle = ctx.fillStyle = `rgb(${rects[x + y * rn].color})`;
      ctx.fillRect(x * 20, y * 20, 20, 20);
      if ('is_eater' in rects[x + y * rn]) {
        ctx.fillStyle = 'black';
        ctx.fillText(rects[x + y * rn].is_eater, x * 20 + 5, y * 20 + 14);
      }
    } else {
      ctx.fillStyle = 'white';
      ctx.fillText(rects[x + y * rn].is_prey, x * 20 + 5, y * 20 + 14);
    }
  }
}
