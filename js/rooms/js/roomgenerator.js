//
function RoomGenerator({ space, rsize, pmin, pmax, rmin, rmax, sque, door, doorjb, drnd }, Random) {
  space  = space  ||          10; // surface size
  rsize  = rsize  ||         1.2; // rect size
  pmin   = pmin   ||         0.2; // prey separator (%)
  pmax   = pmax   ||         0.8;
  rmin   = rmin   ||         0.7; // how small can be resized rect (%)
  rmax   = rmax   ||         0.9;
  sque   = sque   ||         0.1; // squeezes rooms
  door   = door   ||         0.8; // door size
  doorjb = doorjb ||         0.2; // door safe offset (doorjamb)
  drnd   = drnd   ||        0.05; // removes duplicit doors (%)
  Random = Random || Math.random;

  const EPS = 0.1;              // see push_gap
  const rn = ~~(space / rsize); // rects number (same for columns and rows)
  const I = (x,y) => (x < 0 || x >= rn || y < 0 || y >= rn) ? -1 : (x + y * rn);

  const rects = []; // [x, y, w, h], ...
  const points = [];
  const vaodata = { // VAO data.
    coordinates: [],
    texcoords  : [],
    tangents   : [],
    normals    : [],
    indices    : [],
  };

  {
    // Randomizes sizes of rows and columns, but saves geometry.
    const rowsizes = normarr(rn, rmin, rmax).map(e => e * space);
    const colsizes = normarr(rn, rmin, rmax).map(e => e * space);
    let i = 0, rpy = 0;
    for (let y = 0; y < rn; ++y) {
      const rys = rowsizes[y];
      let rpx = 0;
      for (let x = 0; x < rn; ++x) {
        const rxs = colsizes[x];
        rects.push([rpx, rpy, rxs, rys]);
        rects[rects.length - 1].index = i;
        rects[rects.length - 1].color = Array(3).fill()
          .map(_ => 100 + Random() * 156 | 0);
        ++i;
        rpx += rxs;
      }
      rpy += rys;
    }


    // Breaks geometry by removing some rectangles and resizing neighbours.
    for (let y = 0; y < rn; ++y)
      for (let x = 0; x < rn; ++x)
    {
      if (Random() < 0.5 && !(x < 1 || x >= rn - 1))
        absorb(I(x, y), I(x - 1, y), I(x + 1, y), 2, 0, 'HLR', 0.2, 0.8);
      else if (                  !(y < 1 || y >= rn - 1))
        absorb(I(x, y), I(x, y - 1), I(x, y + 1), 3, 1, 'VTB', 0.2, 0.8);
    }


    // Squeezes.
    rects.forEach(e => {
      e[0] += sque;
      e[1] += sque;
      e[2] -= sque * 2;
      e[3] -= sque * 2;
    });


    // Calculates gaps.
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
      // creating dictionary R replacing all preys with eaters
      const R = {};
      for (let i = 0; i < names.length; ++i) {
        const r = rects[indices[i]];
        const a = (R[names[i]] = []);
        if (!r        ) {            continue; } // if no rect in this index, skip
        if ( r === C  ) {            continue; } // do not add self
        if (!r.is_prey) { a.push(r); continue; } // if is a not prey, push itself
        // if is a prey, push eaters instead, but not add self
        if (r.prey_TL !== C) { a.push(r.prey_TL); }
        if (r.prey_BR !== C) { a.push(r.prey_BR); }

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


    // Finding all doors (only bottom and right) and creates doors graph.
    const graph = rects.map(_ => []);
    for (let i = 0; i < rects.length; ++i) {
      const r = rects[i];
      if ('gaps' in r) {
        for (let g of r.gaps.B) {
          if ('door' in g) continue; // skip if door exists
          const dlen = Math.abs(g[2] - g[0]) - (door + doorjb * 2);
          if (dlen > 0) {
            g.door = [g[0] + Random() * dlen + doorjb, g[1], door, sque * 2]; // (x, y, w, h)
            graph[i].push(g.index);
            graph[g.index].push(i);
          }
        }
        for (let g of r.gaps.R) {
          if ('door' in g) continue; // skip if door exists
          const dlen = Math.abs(g[3] - g[1]) - (door + doorjb * 2);
          if (dlen > 0) {
            g.door = [g[0], g[1] + Random() * dlen + doorjb, sque * 2, door]; // (x, y, w, h)
            graph[i].push(g.index);
            graph[g.index].push(i);
          }
        }
      }
    }


    // Graph optimization.
    // 0--1--2
    // |\ | /|
    // 6--4--8   All possible connections are here.
    //  \ | /
    //    7
    const G = graph.map(_ => new Set());
    const used = [];
    // First index is random.
    let index;
    for (let INF = graph.length; --INF; ) {
      (index = Random() * graph.length | 0);
      if (!graph[index].length) index = (index + 1) % graph.length; else break;
    }
    // Creates optimised graph G (w/o duplicit edges).
    (function push_edge(i) {
      for (let k of graph[i]) {
        used[i] = true;
        if (!used[k]) {
          used[k] = true;
          G[i].add(k);
          G[k].add(i);
          push_edge(k);
        }
      }
    })(index);
    // 0--1  2
    // |    /|
    // 6  4  8   Duplicit connections removed.
    //  \ |
    //    7
    // Additional edges.
    for (let i = 0; i < G.length; ++i)
      for (let k of graph[i])
        if (Random() < drnd)
        {
          G[i].add(k);
          G[k].add(i);
        }
    // 0--1  2
    // |\ | /|
    // 6  4--8   Some random duplications added.
    //  \ |
    //    7


    // Removes doors according to optimized graph.
    for (let i = 0; i < rects.length; ++i) {
      const r = rects[i];
      if ('gaps' in r) {
        for (let g of r.gaps.B)
          if ('door' in g && ([...G[i]].findIndex(j => j === g.index) < 0))
            delete g.door;
        for (let g of r.gaps.R)
          if ('door' in g && ([...G[i]].findIndex(j => j === g.index) < 0))
            delete g.door;
        // Creates points for RoomRenderer.
        r.pointsT = [r[0], r[0] + r[2]];
        r.pointsB = [r[0], r[0] + r[2]];
        r.pointsL = [r[1], r[1] + r[3]];
        r.pointsR = [r[1], r[1] + r[3]];
      }
    }


    // Adds doors to the points.
    for (let i = 0; i < rects.length; ++i) {
      const r = rects[i];
      if ('gaps' in r) {
        for (let g of r.gaps.B) if ('door' in g) {
          const p1 = g.door[0], p2 = g.door[0] + g.door[2];
          r.pointsB.push(p1, p2);
          rects[g.index].pointsT.push(p1, p2);
        }
        for (let g of r.gaps.R) if ('door' in g) {
          const p1 = g.door[1], p2 = g.door[1] + g.door[3];
          r.pointsR.push(p1, p2);
          rects[g.index].pointsL.push(p1, p2);
        }
      }
    }


    // Sorts points.
    for (let r of rects) {
      if ('gaps' in r) {
        r.pointsT = r.pointsT.sort((a,b) => a - b).map(p => [p, r[1]       ]);
        r.pointsB = r.pointsB.sort((a,b) => a - b).map(p => [p, r[1] + r[3]]);
        r.pointsL = r.pointsL.sort((a,b) => a - b).map(p => [r[0]       , p]);
        r.pointsR = r.pointsR.sort((a,b) => a - b).map(p => [r[0] + r[2], p]);
        for (let i = 0; i < r.pointsT.length; i += 2) points.push([...r.pointsT[i+0],...r.pointsT[i+1]]);
        for (let i = 0; i < r.pointsB.length; i += 2) points.push([...r.pointsB[i+1],...r.pointsB[i+0]]);
        for (let i = 0; i < r.pointsL.length; i += 2) points.push([...r.pointsL[i+1],...r.pointsL[i+0]]);
        for (let i = 0; i < r.pointsR.length; i += 2) points.push([...r.pointsR[i+0],...r.pointsR[i+1]]);
      }
    }







  }


  ////////////////////////////////////////////////////////////////


  // Randomizes sizes of rows and columns, but saves geometry.
  function normarr(num = 1, min = 0, max = 1) {
    let out = Array(num).fill().map(_ => min + Random() * (max - min));
    const sum = out.reduce((a,c) => a + c, 0);
    out = out.map(e => e / sum);
    return out;
  }


  // Breaks geometry by removing some rectangles and resizing neighbours.
  function absorb(_i, _m, _p, rk, rj, sym, min, max) {
    // is_prey  -- съедаемое, не рисуется (направление: H,V)
    // is_eater -- съедающее, заполняет место съедаемого (направление: T,B,R,L)
    // prey_TL  -- ссылка на прямоугольник, съедающий данный сверху (слева)
    // prey_BR  -- ссылка на прямоугольник, съедающий данный снизу (справа)
    if (!('is_prey' in rects[_i] || 'is_eater' in rects[_i]
    ||    'is_prey' in rects[_m] || 'is_eater' in rects[_m]
    ||    'is_prey' in rects[_p] || 'is_eater' in rects[_p]))
    {
      const n = min + Random() * (max - min) * rects[_i][rk];
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
    // HACK: Иногда создаются линии близкие по длине к 0, не знаю
    //       почему. Дополнительное условие решает проблему.
    if (di && y2 - y1 < EPS || !di && x2 - x1 < EPS) return;
    const g = [x1, y1, x2, y2];
    g.index = r.index; // save neighbour index
    (C.gaps[key].some(e => e.every((e,i) => e === g[i]))) || C.gaps[key].push(g);
  }


  // Draws.
  function draw(ctx, S1 = 3, S2 = 6, scaler = 40) {
    const draw_gap = (e, a) => {
      ctx.beginPath();
      ctx.moveTo(e[0] * scaler + a[0], e[1] * scaler + a[1]);
      ctx.lineTo(e[2] * scaler + a[2], e[3] * scaler + a[3]);
      ctx.stroke();
    }

    for (let r of rects) {
      if ('gaps' in r) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = ctx.fillStyle = `rgb(${r.color})`;

        ctx.fillText(r.index, r[0] * scaler + S1 + 5, r[1] * scaler + S1 + 14);

        ctx.fillText('T:'+r.gaps.T.map(e => e.index), r[0] * scaler + S1 + 5, r[1] * scaler + S1 + 14 * 2);
        ctx.fillText('L:'+r.gaps.L.map(e => e.index), r[0] * scaler + S1 + 5, r[1] * scaler + S1 + 14 * 3);
        ctx.fillText('R:'+r.gaps.R.map(e => e.index), r[0] * scaler + S1 + 5, r[1] * scaler + S1 + 14 * 4);
        ctx.fillText('B:'+r.gaps.B.map(e => e.index), r[0] * scaler + S1 + 5, r[1] * scaler + S1 + 14 * 5);

        r.gaps.T.forEach(e => draw_gap(e, [+S1, +S1, -S1, +S1]));
        r.gaps.L.forEach(e => draw_gap(e, [+S1, +S1, +S1, -S1]));
        r.gaps.R.forEach(e => draw_gap(e, [-S1, +S1, -S1, -S1]));
        r.gaps.B.forEach(e => draw_gap(e, [+S1, -S1, -S1, -S1]));

        ctx.strokeStyle = ctx.fillStyle = `rgb(${r.color.map(e => e >> 2)})`;
        ctx.strokeRect(r[0] * scaler + S2, r[1] * scaler + S2, r[2] * scaler - S2 * 2, r[3] * scaler - S2 * 2);

        ctx.strokeStyle = ctx.fillStyle = `rgb(${r.color})`;
        r.gaps.B.forEach(e => (e.door) && ctx.fillRect(
          e.door[0] * scaler + S1,     e.door[1] * scaler + S1    ,
          e.door[2] * scaler + S1 * 2, e.door[3] * scaler + S1 * 2,
        ));
        r.gaps.R.forEach(e => (e.door) && ctx.fillRect(
          e.door[0] * scaler + S1,     e.door[1] * scaler + S1    ,
          e.door[2] * scaler + S1 * 2, e.door[3] * scaler + S1 * 2,
        ));
      }
    }
  }


  // Draws.
  function draw_scheme(ctx, S1 = 20) {
    for (let y = 0; y < rn; ++y)
      for (let x = 0; x < rn; ++x)
    {
      if ('is_prey' in rects[x + y * rn] === false) {
        ctx.strokeStyle = ctx.fillStyle = `rgb(${rects[x + y * rn].color})`;
        ctx.fillRect(x * S1, y * S1, S1, S1);
        if ('is_eater' in rects[x + y * rn]) {
          ctx.fillStyle = 'black';
          ctx.fillText(rects[x + y * rn].is_eater, x * S1 + 5, y * S1 + 14);
        }
      } else {
        ctx.fillStyle = 'white';
        ctx.fillText(rects[x + y * rn].is_prey, x * S1 + 5, y * S1 + 14);
      }
    }
  }


  // Out.
  return {
    points,
    rects,
    draw,
    draw_scheme,
  }
}
