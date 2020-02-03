
window.onload = async () => {
  const matrix =[2.4,0,0,0,0,0.2,0.9,0.9,0,-2.4,0.1,0.1,0,-0.6,1.3,1.3];

  const colors = Array(50).fill().map(_ => {
    const b = 10 + Math.random() * 100 | 0;
    return [b / 2, b / 2, b + Math.random() * (256 - b) | 0];
  });

  const GW = 15;
  const GH = 15;

  const fac1 = 0.55;
  const siz1 = 0.05;
  const fac2 = 0.15;
  const siz2 = 0.15;

  const grad3 = [
    [+1,+1,+0], [-1,+1,+0], [+1,-1,+0], [-1,-1,+0],
    [+1,+0,+1], [-1,+0,+1], [+1,+0,-1], [-1,+0,-1],
    [+0,+1,+1], [+0,-1,+1], [+0,+1,-1], [+0,-1,-1],
  ];

  const perm = Array(256).fill().map((_,i)=>i);

  const mix = (a, b, t) => (1 - t) * a + t * b;
  const dot = (g, x, y, z) => g[0] * x + g[1] * y + g[2] * z;
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);

  function noise(x, y, z) {
    let X = Math.floor(x);
    let Y = Math.floor(y);
    let Z = Math.floor(z);
    x = x - X;
    y = y - Y;
    z = z - Z;
    X = X & 255;
    Y = Y & 255;
    Z = Z & 255;
    const dim = 12;
    const n000 = dot(grad3[perm[(X + 0 + perm[(Y + 0 + perm[(Z + 0) & 255]) & 255]) & 255] % dim], x - 0, y - 0, z - 0);
    const n001 = dot(grad3[perm[(X + 0 + perm[(Y + 0 + perm[(Z + 1) & 255]) & 255]) & 255] % dim], x - 0, y - 0, z - 1);
    const n010 = dot(grad3[perm[(X + 0 + perm[(Y + 1 + perm[(Z + 0) & 255]) & 255]) & 255] % dim], x - 0, y - 1, z - 0);
    const n011 = dot(grad3[perm[(X + 0 + perm[(Y + 1 + perm[(Z + 1) & 255]) & 255]) & 255] % dim], x - 0, y - 1, z - 1);
    const n100 = dot(grad3[perm[(X + 1 + perm[(Y + 0 + perm[(Z + 0) & 255]) & 255]) & 255] % dim], x - 1, y - 0, z - 0);
    const n101 = dot(grad3[perm[(X + 1 + perm[(Y + 0 + perm[(Z + 1) & 255]) & 255]) & 255] % dim], x - 1, y - 0, z - 1);
    const n110 = dot(grad3[perm[(X + 1 + perm[(Y + 1 + perm[(Z + 0) & 255]) & 255]) & 255] % dim], x - 1, y - 1, z - 0);
    const n111 = dot(grad3[perm[(X + 1 + perm[(Y + 1 + perm[(Z + 1) & 255]) & 255]) & 255] % dim], x - 1, y - 1, z - 1);
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    const nx00 = mix(n000, n100, u);
    const nx01 = mix(n001, n101, u);
    const nx10 = mix(n010, n110, u);
    const nx11 = mix(n011, n111, u);
    const nxy0 = mix(nx00, nx10, v);
    const nxy1 = mix(nx01, nx11, v);
    const nxyz = mix(nxy0, nxy1, w);
    return nxyz;
  }

  function transformMat4(out, a, m) {
    let x = a[0], y = a[1], z = a[2];
    let w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
  }

  function to_pos2(pos3, pmat, w, h) {
    const pos2 = [];
    transformMat4(pos2, pos3, pmat);
    pos2[0] /= +pos2[2];
    pos2[1] /= -pos2[2];
    return [
      (pos2[0] + 1) * w / 2,
      (pos2[1] + 1) * h / 2,
    ];
  }

  function bresenham_4con(x1, y1, x2, y2, ctx) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? +1 : -1;
    const sy = y1 < y2 ? +1 : -1;
    let e = 0;
    for (let i = dx + dy + 1; i > 0; i--) {
      ctx.fillRect(~~x1, ~~y1, 1, 1);
      const e1 = e + dy;
      const e2 = e - dx;
      if (Math.abs(e1) < Math.abs(e2)) {
        x1 += sx; e = e1;
      } else {
        y1 += sy; e = e2;
      }
    }
  }

  function fill_convex(c, v, len, ctx) {
    for (let i = 0; i < len - 2; ++i) {
      let x1 = c[v[i]][0];
      let y1 = c[v[i]][1];
      const x2 = c[v[i + 1]][0];
      const y2 = c[v[i + 1]][1];
      const dx = Math.abs(x2 - x1);
      const dy = Math.abs(y2 - y1);
      const sx = x1 < x2 ? +1 : -1;
      const sy = y1 < y2 ? +1 : -1;
      let err = (dx > dy ? dx : -dy) >> 1;
      let e2;
      for (let k = dx + dy + 1; k > 0; k--) {
        bresenham_4con(x1, y1, c[v[len - 1]][0], c[v[len - 1]][1], ctx);
        if (x1 == x2 && y1 == y2) break;
        e2 = err;
        if (e2 >= -dx) { err -= dy; x1 += sx; }
        if (e2 <   dy) { err += dx; y1 += sy; }
      }
    }
  }

  const rain = Array(70).fill().map(_ => [Math.random() * 100, Math.random() * 50]);
  function rain_proc(ctx) {
    rain.forEach((e, i) => {
      e[0] += 1;
      e[1] += 5;
      ctx.fillStyle = `rgb(${colors[i % colors.length]})`;
      ctx.fillRect(e[0] | 0, e[1] | 0, 1, 1);
      ctx.fillRect(e[0] | 0, e[1] + 1 | 0, 1, 1);
      if (e[0] > 100) e[0] = -50 + Math.random() * 50 | 0;
      if (e[1] > 50) e[1] = -1;
    });
  }

  let thunders = Array(10).fill().map(_ => {
    let timer = Math.random() * 100 | 0;
    let a = false;
    const thunder = [];
    function thunder_draw(ctx) {
      if (timer++ > 70) {

        if (thunder.length === 0) {
          thunder[0] = [20 + Math.random() * 60 | 0, Math.random() * 20 | 0];
        }
        thunder.push([
          thunder[thunder.length - 1][0] + (-1 + Math.random() * 3) * (1 + Math.random() * 10),
          thunder[thunder.length - 1][1] + (-1 + Math.random() * 3) * (1 + Math.random() * 10)
        ]);
        if (thunder.length > 10) {
          thunder.length = 0;
          timer = 0;
        }
      }
      if (a) {
        for (let i = 0; i < thunder.length - 1; ++i) {
          ctx.fillStyle = 'white';
          bresenham_4con(thunder[i][0], thunder[i][1], thunder[i + 1][0], thunder[i + 1][1], ctx);
        }
      }
      a = !a;
    }
    return thunder_draw;
  });

  const img = new Image();
  img.src = IMG;
  await new Promise(r => img.onload = r);

  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = 100;
  ctx.canvas.height = 100;
  ctx.canvas.style.width = 300;
  ctx.canvas.style.height = 200;
  ctx.canvas.style.imageRendering = 'pixelated';
  document.body.appendChild(ctx.canvas);

  let ox1 = 0, oy1 = 0, oz1 = 0;
  let ox2 = 0, oy2 = 0, oz2 = 0;

  const render = () => {
    ox1 += 0.50; oy1 -= 0.10; oz1 -= 0.10;
    ox2 -= 0.10; oy2 -= 0.30; oz2 += 0.01;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 100, 100);

    ctx.fillStyle = 'blue';
    ctx.fillText('nobody is water wizard', 100, 100);

    thunders.forEach(e => e(ctx));
    ctx.drawImage(img, 40, 40);

    let map = [];
    const w = GW + 1;
    const h = GH + 1;
    const I = (x, y) => (x < 0 || x >= w || y < 0 || y >= h) ? -1 : (x + y * w);
    for (let y = 0; y < h; ++y)
      for (let x = 0; x < w; ++x)
    {
      map.push([
        (-1 + (x + 0) / GW * 2),
        (+1 - (y + 0) / GH * 2),
        +noise((x + 0 + ox1) * fac1, (y + 0 + oy1) * fac1, oz1) * siz1
        +noise((x + 0 + ox2) * fac2, (y + 0 + oy2) * fac2, oz2) * siz2,
      ]);
    }

    let k = 0;
    for (let y = 0; y < h - 2; ++y)
      for (let x = 0; x < w - 1; ++x)
    {
      const p1 = to_pos2(map[I(x + 0, y + 0)], matrix, 100, 100);
      const p2 = to_pos2(map[I(x + 1, y + 0)], matrix, 100, 100);
      const p3 = to_pos2(map[I(x + 1, y + 1)], matrix, 100, 100);
      const p4 = to_pos2(map[I(x + 0, y + 1)], matrix, 100, 100);
      ctx.fillStyle = `rgb(${colors[(k++) % colors.length]})`; fill_convex([p1, p2, p3], [0, 1, 2], 3, ctx);
      ctx.fillStyle = `rgb(${colors[(k++) % colors.length]})`; fill_convex([p1, p3, p4], [0, 1, 2], 3, ctx);
    }

    rain_proc(ctx);

    requestAnimationFrame(render);
  }

  render();
}

var IMG = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAWCAIAAACt/zAoAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADbSURBVDhPrZHBDcIwDEUzCEf24Mo4bMAOjNAJmIALV8bg0EvFCOXH3/2NnJSqFU+RZcd+DQlpidP55dkmoHF5bVwNJtxp0fWlWTpKrFORHZO9Np4TXjeg0/WX20OyHCUNMP1537ngc5MCYM7NCI4aDkdoiDLJokPQHscRJmIYXTEB5XruTyZuxWfkyhezt8UQIlfZzVGwpzmucseF6h+eCdPKdc6ve0pWgk94b9Wks8ekUJvQCMtIMBFLU7FBbWbZsPMyLCOloE94b9M980/d/UIbzsQhMU7MZkpfgkwzjKmU16QAAAAASUVORK5CYII=`;
