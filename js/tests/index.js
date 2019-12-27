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

  rects.draw = function (sts = 4) {
    for (let r of rects) {
      if ('is_prey' in r) continue;
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

  const qs = 240;
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
    /**/ if (!(x < 1 || x >= w - 1) && Math.random() < 0.5)
      absorb(I(x, y), I(x - 1, y), I(x + 1, y), 2, 0, 'HLR');
    else if (!(y < 1 || y >= h - 1))
      absorb(I(x, y), I(x, y - 1), I(x, y + 1), 3, 1, 'VTB');
  }

  // Calculates gaps.

  const gap_size = 6;

  // for (let y = 0; y < rn; ++y)
  //   for (let x = 0; x < rn; ++x)
  {
    let x = 0;
    let y = 0;


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
      if (!r) continue;
      if (!r.is_prey) { a.push(r); continue; }
      a.push(r.prey_TL, r.prey_BR);
    }

    console.log(R);

    // each gap contain gap-line (part of wall where gap can be placed)
    // and information about wall itself (is wall a border or not).
    const gaps = {
      top: [],
      left: [],
      right: [],
      bottom: [],
    };



    let tops = [...R.TM];
    R.TL.forEach(r => (r[0] + r[2] > C[0]) && tops.push(r));
    R.TR.forEach(r => (r[0] < C[0] + C[2]) && tops.push(r));
    tops = [...(new Set(tops))]; // removing repeats

    let bottoms = [...R.BM];
    R.BL.forEach(r => (r[0] + r[2] > C[0]) && bottoms.push(r));
    R.BR.forEach(r => (r[0] < C[0] + C[2]) && bottoms.push(r));
    bottoms = [...(new Set(bottoms))];

    let lefts = [...R.ML];
    R.TL.forEach(r => (r[1] + r[3] > C[1]) && lefts.push(r));
    R.BL.forEach(r => (r[1] < C[1] + C[3]) && lefts.push(r));
    lefts = [...(new Set(lefts))];

    let rights = [...R.MR];
    R.TR.forEach(r => (r[1] + r[3] > C[1]) && rights.push(r));
    R.BR.forEach(r => (r[1] < C[1] + C[3]) && rights.push(r));
    rights = [...(new Set(rights))];


    console.log(bottoms);



    lefts.forEach(r => {
      const dv = C[1] - r[1];

      let x1;
      let y1;
      let x2;
      let y2;

      ctx.save();
      ctx.translate(150, 150);
      ctx.lineWidth = 4;
      ctx.beginPath();

      if (dv >= 0) {
        const v = r[3] - dv;
        x1 = C[0];
        y1 = C[1];
        x2 = C[0];
        y2 = C[1] + v;

        // TODO: make this for horisontal too
        (y2 - y1 > C[3]) && (y2 = y1 + C[3]);

        ctx.strokeStyle = 'green';
        ctx.moveTo(x1, y1 + gap_size);
        ctx.lineTo(x2, y2 - gap_size);

      } else if (dv < 0) {
        const v = C[3] + dv;
        x1 = C[0];
        y1 = C[1] + C[3] - v;
        x2 = C[0];
        y2 = C[1] + C[3];

        ctx.strokeStyle = 'yellow';
        ctx.moveTo(x1, y1 + gap_size);
        ctx.lineTo(x2, y2 - gap_size);

      }

      ctx.stroke();
      ctx.restore();

    });





    rights.forEach(r => {
      const dv = C[1] - r[1];

      let x1;
      let y1;
      let x2;
      let y2;

      ctx.save();
      ctx.translate(150, 150);
      ctx.lineWidth = 4;
      ctx.beginPath();

      if (dv >= 0) {
        const v = r[3] - dv;
        x1 = C[0] + C[2];
        y1 = C[1];
        x2 = C[0] + C[2];
        y2 = C[1] + v;

        (y2 - y1 > C[3]) && (y2 = y1 + C[3]);

        ctx.strokeStyle = 'green';
        ctx.moveTo(x1, y1 + gap_size);
        ctx.lineTo(x2, y2 - gap_size);

      } else if (dv < 0) {
        const v = C[3] + dv;

        x1 = C[0] + C[2];
        y1 = C[1] + C[3] - v;
        x2 = C[0] + C[2];
        y2 = C[1] + C[3];

        ctx.strokeStyle = 'yellow';
        ctx.moveTo(x1, y1 + gap_size);
        ctx.lineTo(x2, y2 - gap_size);
      }

      ctx.stroke();
      ctx.restore();

    });













    tops.forEach(r => {
      const dv = C[0] - r[0];

      let x1;
      let y1;
      let x2;
      let y2;

      ctx.save();
      ctx.translate(150, 150);
      ctx.lineWidth = 4;
      ctx.beginPath();

      if (dv >= 0) {
        const v = r[2] - dv;
        x1 = C[0];
        y1 = C[1];
        x2 = C[0] + v;
        y2 = C[1];

        ctx.strokeStyle = 'red';
        ctx.moveTo(x1 + gap_size, y1);
        ctx.lineTo(x2 - gap_size, y2);

      } else {
        const v = C[2] + dv;
        x1 = C[0] + C[2] - v;
        y1 = C[1];
        x2 = C[0] + C[2];
        y2 = C[1];

        ctx.strokeStyle = 'blue';
        ctx.moveTo(x1 + gap_size, y1);
        ctx.lineTo(x2 - gap_size, y2);

      }

      ctx.stroke();
      ctx.restore();

    });




    bottoms.forEach(r => {
      const dv = C[0] - r[0];

      console.log({ dv });

      let x1;
      let y1;
      let x2;
      let y2;

      ctx.save();
      ctx.translate(150, 150);
      ctx.lineWidth = 4;
      ctx.beginPath();

      if (dv >= 0) {
        const v = r[2] - dv;
        x1 = C[0];
        y1 = C[1] + C[3];
        x2 = C[0] + v;
        y2 = C[1] + C[3];

        ctx.strokeStyle = 'red';
        ctx.moveTo(x1 + gap_size, y1);
        ctx.lineTo(x2 - gap_size, y2);

      } else {
        const v = C[2] + dv;
        x1 = C[0] + C[2] - v;
        y1 = C[1] + C[3];
        x2 = C[0] + C[2];
        y2 = C[1] + C[3];

        ctx.strokeStyle = 'blue';
        ctx.moveTo(x1 + gap_size, y1);
        ctx.lineTo(x2 - gap_size, y2);

      }

      ctx.stroke();
      ctx.restore();

    });





  }



  // Draw.

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
