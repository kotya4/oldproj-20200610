// window.onload = function() {


//   const ctx = document.createElement('canvas').getContext('2d');
//   ctx.canvas.height = 600;
//   ctx.canvas.width = 600;
//   document.body.appendChild(ctx.canvas);

//   ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

//   const colors = Array(50).fill().map(_ => Array(3).fill().map(_ => Math.random() * 256 | 0));
//   let color_index = 0;

//   function divide_rect(out, rect, rsize, depth = 0xffff, name = '') {
//     if (!(out instanceof Array)) throw Error('First argument must be array');

//     if (--depth <= 0) {
//       out.push(rect);
//       rect.name = name;
//       return out;
//     }

//     const w = rect[2];
//     const h = rect[3];


//     let rect_1, rect_2, choosen_side;
//     const scalerw = w - rsize[0] * 2;
//     const scalerh = h - rsize[1] * 2;

//     if (scalerw > 0 && scalerh > 0) {
//       choosen_side = Math.random() < 0.5;
//     } else if (scalerw > 0) {
//       choosen_side = true;
//     } else if (scalerh > 0) {
//       choosen_side = false;
//     } else {
//       out.push(rect);
//       rect.name = name;
//       return;
//     }

//     if (choosen_side) { // width
//       const offset = rsize[0] + Math.random() * scalerw | 0;
//       rect_1 = [rect[0]         , rect[1], offset, rect[3]];
//       rect_2 = [rect[0] + offset, rect[1], rect[2] - offset, rect[3]];
//     } else { // height
//       const offset = rsize[1] + Math.random() * scalerh;
//       rect_1 = [rect[0], rect[1]         , rect[2], offset];
//       rect_2 = [rect[0], rect[1] + offset, rect[2], rect[3] - offset];
//     }

//     divide_rect(out, rect_1, rsize, depth, name + ['T', 'L'][+choosen_side]);
//     divide_rect(out, rect_2, rsize, depth, name + ['B', 'R'][+choosen_side]);
//   }

//   let i = 0;
//   function draw_rect(r) {
//     ctx.fillStyle = `rgb(${colors[color_index]})`;
//     ctx.fillRect(r[0], r[1], r[2], r[3]);
//     ctx.fillStyle = 'black';
//     ctx.fillText(`${i} ${r.name}`, r[0] + 5, r[1] + 20);
//     color_index = (color_index + 1) % colors.length;
//     ++i;
//   }


//   const rects = [];
//   divide_rect(rects, [0, 0, ctx.canvas.width, ctx.canvas.height], [80, 80]);


//   console.log(rects);

//   //ctx.translate(150, 150);
//   for (let rect of rects) {
//     draw_rect(rect);
//   }

// }


window.onload = function() {

  //Math.seedrandom(1);

  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.height = 600;
  ctx.canvas.width = 600;
  document.body.appendChild(ctx.canvas);

  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const rects = [];
  const qs = 300;
  const rs = 60;
  const rn = qs / rs;

  function draw_rect(r, sts = 4) {
    ctx.strokeStyle = ctx.fillStyle = `rgb(${r.color})`;
    // ctx.fillRect(r[0], r[1], r[2], r[3]);
    ctx.strokeRect(r[0] + sts, r[1] + sts, r[2] - sts * 2, r[3] - sts * 2);
    ctx.fillText(r.index, r[0] + sts + 5, r[1] + sts + 14);
  }


  function normal_arr(out = [], num = 1, min = 0, max = 1) {
    out = Array(num).fill().map(_ => min + Math.random() * (max - min));
    const sum = out.reduce((a,c) => a + c, 0);
    out = out.map(e => e / sum);
    return out;
  }


  function absorb_rect(ax, ay) {
    const min = 0.2;
    const max = 0.8;
    const w = rn;
    const h = rn;
    const index = (x, y) => x + y * w;
    if (Math.random() < 0.5) {
      // const ax = 1 + Math.random() * (w - 2) | 0;
      // const ay = 0 + Math.random() * (h - 0) | 0;
      if ((ax < 1 || ax >= w - 1)
      ||  rects[index(ax, ay)] === null
      ||  rects[index(ax - 1, ay)] === null
      ||  rects[index(ax + 1, ay)] === null
      ||  'absorbed' in rects[index(ax, ay)]
      ||  'absorbed' in rects[index(ax - 1, ay)]
      ||  'absorbed' in rects[index(ax + 1, ay)])
      {
        return;
      }
      const ra = rects[index(ax, ay)];
      const n = min + Math.random() * (max - min) * ra[2];
      rects[index(ax - 1, ay)][2] += n;
      rects[index(ax + 1, ay)][0] = ra[0] + n;
      rects[index(ax + 1, ay)][2] += ra[2] - n;
      rects[index(ax - 1, ay)].absorbed = 'L';
      rects[index(ax + 1, ay)].absorbed = 'R';
      rects[index(ax, ay)] = null;
    } else {
      // const ax = 0 + Math.random() * (w - 0) | 0;
      // const ay = 1 + Math.random() * (h - 2) | 0;
      if ((ay < 1 || ay >= h - 1)
      ||  rects[index(ax, ay)] === null
      ||  rects[index(ax, ay - 1)] === null
      ||  rects[index(ax, ay + 1)] === null
      ||  'absorbed' in rects[index(ax, ay)]
      ||  'absorbed' in rects[index(ax, ay - 1)]
      ||  'absorbed' in rects[index(ax, ay + 1)])
      {
        return;
      }
      const ra = rects[index(ax, ay)];
      const n = min + Math.random() * (max - min) * ra[3];
      rects[index(ax, ay - 1)][3] += n;
      rects[index(ax, ay + 1)][1] = ra[1] + n;
      rects[index(ax, ay + 1)][3] += ra[3] - n;
      rects[index(ax, ay - 1)].absorbed = 'T';
      rects[index(ax, ay + 1)].absorbed = 'B';
      rects[index(ax, ay)] = null;
    }
  }



  const rowsizes = normal_arr([], rn, 0.7).map(e => e * qs);
  const colsizes = normal_arr([], rn, 0.7).map(e => e * qs);


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



  for (let y = 0; y < rn; ++y) {
    for (let x = 0; x < rn; ++x) {
      absorb_rect(x, y);
    }
  }



  ctx.translate(150, 150);
  ctx.lineWidth = 2;
  for (let rect of rects) {
    if (rect) draw_rect(rect);
  }

  ctx.translate(-150, -150);
  for (let y = 0; y < rn; ++y) {
    for (let x = 0; x < rn; ++x) {
      if (rects[x + y * rn]) {
        ctx.strokeStyle = ctx.fillStyle = `rgb(${rects[x + y * rn].color})`;
        ctx.fillRect(x * 20, y * 20, 20, 20);
        if (rects[x + y * rn].absorbed) {
          ctx.fillStyle = 'black';
          ctx.fillText(rects[x + y * rn].absorbed, x * 20 + 5, y * 20 + 14);
        }
      }
    }
  }
}
