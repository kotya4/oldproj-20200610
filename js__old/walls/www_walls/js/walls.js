'use strict';

function Walls(args = {}) {
  // enum
  const ROT = 1;
  const MOV = 2;

  function intersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    const d12 = x1*y2-y1*x2;
    const d34 = x3*y4-y3*x4;
    const d14 = (x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);
    const x = (d12*(x3-x4)-d34*(x1-x2))/d14;
    const y = (d12*(y3-y4)-d34*(y1-y2))/d14;
    return { x: x, y: y }
  }

  function arg(key, def) {
    return key in args ? args[key] : def;
  }

  const wx = arg('width', 100);  // window width
  const wy = arg('height', 100); // window height
  const cn = arg('depth', 6);    // columns number

  const cx = [...Array(cn)]; // column positions
  cx[0] = 0;
  cx[cn - 1] = wx >> 1;
  for (let i = 1; i < cn - 1; ++i) {
    cx[i] = cx[i - 1] + (wx >> (i + 1));
  }
  const rs = wx / 50.0;    // rotation speed (pix per frame)
  const ms = 50;           // move speed (fps)
  const ad = wx / wy / ms; // acceleration delta
  let ac = 1;              // current acceleration
  let st = 0;              // drawing status
  let mx = 1;              // mirror (+ no, - yes)
  let dx = 0;              // offset (related to mx) (?)
  let w1 = {               // main wall
        // drawable part of map
    ma: [...Array(3)].map(e=>([...Array(cn)].fill(0))),
    pa: -(wy / wx / 2.0) * rs,        // pointer's y speed
    cl: [...Array(cn)].map(e=>({})), // columns by left
    cr: [...Array(cn)].map(e=>({}))  // columns by right
  }
  let w2 = {               // side wall
    ma: [...Array(3)].map(e=>([...Array(cn)].fill(0))),
    pa: -w1.pa,
    cl: [...Array(cn)].map(e=>({})),
    cr: [...Array(cn)].map(e=>({}))
  }

  // pointer (px, py, pa) is an actual point in the screen
  // wich represents where all lines wants to go when room
  // starts to rotate.

  // ma is a "3 x cn" matrix with values:
  //    [[l,m,r],[...]...], where:
  //    *   l -- left wall type,
  //    *   m -- middle wall type,
  //    *   r -- right wall type.
  // Type defined as unsigned integer value wich represents
  // certain object (wall(1), door/void(0), etc).

  reset_w1();
  reset_w2();

  function reset_w1() {
    w1.lx = 0;      // position left
    w1.ly = 0;      //
    w1.rx = wx;     // position right
    w1.ry = 0;      //
    w1.ox = wx / 2; // position center
    w1.oy = wy / 2; //
    w1.px = wx / 2; // pointer
    w1.py = wy / 2; //

    for (let i = 0; i < cn; ++i) {
      w1.cl[i].x  = cx[i];
      w1.cl[i].y  = cx[i] * wy / wx;
      w1.cl[i].dx = 0;
      w1.cl[i].dy = w1.cl[i].y;
      w1.cl[i].sx = -1;
      if (i > 0) {
        w1.cl[i].dx = w1.cl[i - 1].x;
        w1.cl[i].sx = (w1.cl[i - 1].x - w1.cl[i].x) / ms;
      }
      w1.cl[i].sy = w1.cl[i].sx / w1.ox * w1.oy;

      w1.cr[i].x  = -w1.cl[i].x;
      w1.cr[i].y  =  w1.cl[i].y;
      w1.cr[i].dx = -w1.cl[i].dx;
      w1.cr[i].dy =  w1.cr[i].y;
      //w1.cr[i].sx = -w1.cl[i].sx;
      //w1.cr[i].sy =  w1.cl[i].sy;
    }
  }

  function reset_w2() {
    w2.lx = -wx;
    w2.ly = 0;
    w2.rx = 0;
    w2.ry = 0;
    w2.ox = -1;
    w2.oy =  wy / 2;
    w2.px = -wx / 2;
    w2.py = 0;

    for (let i = 0; i < cn; ++i) {
      w2.cl[i].x  = w2.lx;
      w2.cl[i].y  = w1.cl[i].y;
      w2.cl[i].dx = 0;
      w2.cl[i].dy = 0;
      //w2.cl[i].sx = 0;
      //w2.cl[i].sy = 0;

      w2.cr[i].x  = -1;
      w2.cr[i].y  = w1.cl[i].y;
      w2.cr[i].dx = 0;
      w2.cr[i].dy = 0;
      //w2.cr[i].sx = 0;
      //w2.cr[i].sy = 0;
    }
  }

  function cvt_column2arr(w, i, c, d) {
    // left column [x,y,...]
    c[0] = (w.cl[i].x + w.lx) * mx + dx;
    c[1] =  w.cl[i].y;
    c[2] =  c[0];
    c[3] =  wy - c[1];
    // right column [x,y,...]
    c[4] = (w.cr[i].x + w.rx) * mx + dx;
    c[5] =  w.cr[i].y;
    c[6] =  c[4];
    c[7] =  wy - c[5];
    // left door [x,y,...]
    d[0] = (w.cl[i].dx + w.lx) * mx + dx;
    d[1] =  w.cl[i].dy;
    d[2] =  d[0];
    d[3] =  wy - d[1];
    // right door [x,y,...]
    d[4] = (w.cr[i].dx + w.rx) * mx + dx;
    d[5] =  w.cr[i].dy;
    d[6] =  d[4];
    d[7] =  wy - d[5];
  }

  function draw_wall(w, drw) {
    const buf1 = [...Array(8)];
    const buf2 = [...Array(8)];
    let d = [...Array(8)];
    let c = buf1;
    let o = null;
    let flag = true;
    for (let i = 0; i < cn; ++i) {
      cvt_column2arr(w, i, c, d);
      // vertical lines
      drw(c[0], c[1], c[2], c[3], i);
      drw(c[4], c[5], c[6], c[7], i);
      // draws columns on sides
      if (i > 0) { // after first iteration
        if (w.ma[0][i - 1] === 1) { // is wall on left?
          drw(c[0], c[1], o[0], o[1], i);
          drw(c[2], c[3], o[2], o[3], i);
        } else {
          drw(d[0], d[1], c[0], c[1], i);
          drw(d[2], d[3], c[2], c[3], i);
        }
        if (w.ma[2][i - 1] === 1) { // is wall on right?
          drw(c[4], c[5], o[4], o[5], i);
          drw(c[6], c[7], o[6], o[7], i);
        } else {
          drw(d[4], d[5], c[4], c[5], i);
          drw(d[6], d[7], c[6], c[7], i);
        }
      }
      // draws columns on center
      if (w.ma[1][i] === 1) {
        drw(c[0], c[1], c[2], c[3], i); // |
        drw(c[4], c[5], c[6], c[7], i);
        drw(c[0], c[1], c[4], c[5], i); // _
        drw(c[2], c[3], c[6], c[7], i);
        return; // no need to draw other ones
      }
      // copies positions for next use
      o = c;
      // change buffer
      flag = !flag;
      c = flag ? buf1 : buf2;
    }
    // "X" in the end of room while moving
    if (st === MOV) {
      drw(o[0], o[1], w.ox * mx + dx, w.oy, cn);
      drw(o[2], o[3], w.ox * mx + dx, w.oy, cn);
      drw(o[4], o[5], w.ox * mx + dx, w.oy, cn);
      drw(o[6], o[7], w.ox * mx + dx, w.oy, cn);
    }
  }

  function rotate(side) {
    // setup
    if (st !== ROT) {
      st = ROT;
      if (side === -1) {
        mx = -1;
        dx = wx;
      }
    } else if (w2.lx + rs >= 0) {
      st = 0;
      mx = 1;
      dx = 0;
      reset_w1();
      reset_w2();
      return 1; // over
    }
    // applies offset
    w1.rx += rs;
    w1.lx += rs;
    w1.px += rs;
    w1.py += w1.pa;
    w1.ox = w1.lx+(w1.oy-w1.ly)*(w1.px-w1.lx)/(w1.py-w1.ly);

    w2.rx += rs;
    w2.lx += rs;
    w2.px += rs;
    w2.py += w2.pa;
    w2.ox = w2.rx+(w2.oy-w2.ry)*(w2.px-w2.rx)/(w2.py-w2.ry);

    w1.ry = w1.rx/(w2.ox-w1.lx)*(w2.oy-w1.ly);
    w2.ly = w2.lx/(w1.ox-w2.rx)*(w1.oy-w2.ry);

    // redefines columns
    let b = null; // intersection buffer
    for (let i = 0; i < cn; ++i) {
      // main wall column
      w1.cl[i].x = w1.cl[i].y*(w1.ox-w1.lx)/(w1.oy-w1.ly);
      b = intersection(w1.rx,w1.ry,w1.ox,w1.oy,
          w1.cl[i].x+w1.lx,w1.cl[i].y,w2.ox,w2.oy);
      w1.cr[i].x = b.x - w1.rx;
      w1.cr[i].y = b.y;
      // HACK: to delete bugged door lines from screen in the
      // end of rotation because of overflow
      if (w1.cl[i].x < -wx) w1.cl[i].x = 0;
      if (w1.cr[i].x < -wx) w1.cr[i].x = 0;
      // side wall column
      w2.cr[i].x = w2.cr[i].y*(w2.ox-w2.rx)/(w2.oy-w2.ry);
      b = intersection(w2.lx,w2.ly,w2.ox,w2.oy,
          w2.cr[i].x+w2.rx,w2.cr[i].y,w1.ox,w1.oy);
      w2.cl[i].x = b.x - w2.lx;
      w2.cl[i].y = b.y;
      // doors
      if (i > 0) {
        // first wall left
        b = intersection(w1.cl[i-1].x,
            w1.cl[i-1].y,w1.cl[i-1].x,wy-w1.cl[i-1].y,
            w1.cl[i].x,w1.cl[i].y,w2.ox-w1.lx,w2.oy-w1.ly);
        w1.cl[i].dx = b.x;
        w1.cl[i].dy = b.y;
        // frist wall right
        b = intersection(w1.cr[i-1].x,
            w1.cr[i-1].y,w1.cr[i-1].x,wy-w1.cr[i-1].y,
            w1.cr[i].x,w1.cr[i].y,w2.ox-w1.lx,w2.oy-w1.ly);
        w1.cr[i].dx = b.x;
        w1.cr[i].dy = b.y;
        // second wall left
        b = intersection(w2.cl[i-1].x,
            w2.cl[i-1].y,w2.cl[i-1].x,wy-w2.cl[i-1].y,
            w2.cl[i].x,w2.cl[i].y,w1.ox-w2.rx,w1.oy-w2.ry);
        w2.cl[i].dx = b.x;
        w2.cl[i].dy = b.y;
        // second wall right
        b = intersection(w2.cr[i-1].x,
            w2.cr[i-1].y,w2.cr[i-1].x,wy-w2.cr[i-1].y,
            w2.cr[i].x,w2.cr[i].y,w1.ox-w2.rx,w1.oy-w2.ry);
        w2.cr[i].dx = b.x;
        w2.cr[i].dy = b.y;
      }
    }
    return 0; // continues
  }

  function move() {
    // setup
    if (st !== MOV) {
      st = MOV;
      ac = 1;
    // TODO: нулевая колонна двигается с фиксированной скоростью, поэтому
    //       текстура на самой ближней стене будет искажаться при движении
    } else if (w1.cl[0].x <= 3 - ms) {
      st = 0;
      reset_w1();
      return 1; // over
    }
    // moving
    ac += ad;
    for (let i = 0; i < cn; ++i) {
      w1.cl[i].x += w1.cl[i].sx * ac;
      w1.cl[i].y += w1.cl[i].sy * ac;
      w1.cr[i].x -= w1.cl[i].sx * ac;//w1.cr[i].sx * ac;
      w1.cr[i].y += w1.cl[i].sy * ac;//w1.cr[i].sy * ac;
      w1.cl[i].dx = 0;
      if (i > 0) {
        w1.cl[i].dx = w1.cl[i - 1].x;
      }
      w1.cl[i].dy =  w1.cl[i].y;
      w1.cr[i].dx = -w1.cl[i].dx;
      w1.cr[i].dy =  w1.cr[i].y;
    }
    return 0; // continues
  }

  // creates dump of game map according to ==>
  // game map (map, mapw, maph -- mat2, width, height),
  // wall (w -- w1 or w2),
  // direction (d -- 0:up, 1:right, 2:down, 3:left),
  // rotation (r -- +:left, -:right) and
  // position (x, y -- unsigned int)
  function dump_map(map, mapw, maph, w, d, r, x, y) {
    let mmx = x;
    let mmy = y;
    let dx1 = 0;
    let dy1 = 0;
    let dx2 = 0;
    let dy2 = 0;
    switch(d) {
    case 0:
      mmx -= r;
      mmy -= 1;
      dy1 = -1;
      dx2 =  r;
      break;
    case 1:
      mmx += 1;
      mmy -= r;
      dx1 =  1;
      dy2 =  r;
      break;
    case 2:
      mmx += r;
      mmy += 1;
      dy1 =  1;
      dx2 = -r;
      break;
    case 3:
      mmx -= 1;
      mmy += r;
      dx1 = -1;
      dy2 = -r;
    }
    for (let i = 0; i < 3; ++i) {
      let px = mmx;
      let py = mmy;
      for (let c = 0; c < cn; ++c) {
        w.ma[i][c] = 1; // default
        if (px >= 0 && px < mapw && py >= 0 && py < maph) {
          w.ma[i][c] = map[px][py];
        }
        px += dx1;
        py += dy1;
      }
      mmx += dx2;
      mmy += dy2;
    }
  }

  function copy_map() {
    for (let y = 0; y < 3; ++y) {
      for (let x = 0; x < cn; ++x) {
        w1.ma[y][x] = w2.ma[2 - y][x];
      }
    }
  }

  this.demo = function(ctx) {
    const colors = [...Array(cn)].map(function(e,i){
      const c = (255 - 213 / cn * i) / (i + 1) | 0;
      return `rgba(${c},${c},${c},1.0)`;
    });

    let map = [...Array(16)].map(function(e,y){
      return [...Array(16)].map(function(e,x){
        return ('翿䁁坝儑啕䐁啽䄁啷儑嗕䐑坵儅翿'
          .charCodeAt(y) >> x) & 1;
      });
    });

    let px = 7;
    let py = 6;
    let dir = 0; // 0: ^, 1: >, 2: v, 3: <
    let rot = 1; // left(forward): -1, right: +1

    dump_map(map, 16, 16, w1, dir, rot, px, py);

    const F_PRC = 0;
    const F_MOV = 1;
    const F_ROT = 2;
    const F_ERR = 3;
    const F_AHD = 4;

    let flg = F_PRC;

    // internal function (see draw(...))
    function drw(x1, y1, x2, y2, depth) {
      ctx.strokeStyle = colors[depth];
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    function draw_minimap() {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
      for (let y = 0; y < 16; ++y)
        for (let x = 0; x < 16; ++x)
          if (map[x][y])
            ctx.fillRect(220 + x * 5, 5 + y * 5, 4, 4);
      ctx.fillStyle = 'rgba(250, 250, 250, 0.5)';
      ctx.fillRect(220 + px * 5, 5 + py * 5, 4, 4);
    }

    function next_dir() {
      const d = ((map[px][py - 1] === 0) << 0) | // ^
                ((map[px + 1][py] === 0) << 1) | // >
                ((map[px][py + 1] === 0) << 2) | // v
                ((map[px - 1][py] === 0) << 3) ; // <
      const b = (dir + 2) % 4;
      let nd = dir + (Math.random() * 4 | 0);
      for (let i = 0; i < 4; ++i) {
        nd %= 4;
        if (nd !== b && ((d >> nd) & 1)) {
          return {
            rot: ((nd + 1) % 4) === dir ? 1 : -1,
            dir: nd,
            flg: F_ROT
          }
        }
        ++nd;
      }
      return {
        rot: Math.random() * 2 | 0 ? -1 : 1,
        // TODO: dir крутится в одну сторону, вне зависимости
        //       от rot, скорее всего так быть не должно
        dir: dir - 1 < 0 ? 3 : dir - 1,
        flg: F_AHD
      }
    }

    const iid = setInterval(function() {

      if (F_PRC === flg) {
        const next = next_dir();
        if (dir === next.dir) {
          flg = F_MOV;
        } else {
          rot = next.rot;
          dump_map(map, 16, 16, w1, dir, rot, px, py);
          dir = next.dir;
          dump_map(map, 16, 16, w2, dir, rot, px, py);
          flg = next.flg;
        }
      }

      if (F_ROT === flg) {
        if (1 === rotate(rot)) {
          rot = 1;
          dump_map(map, 16, 16, w1, dir, rot, px, py);
          flg = F_MOV;
        }
      }

      if (F_MOV === flg) {
        if (1 === move()) {
          switch (dir) {
          case 0: py--; break;
          case 1: px++; break;
          case 2: py++; break;
          case 3: px--; break;
          }
          dump_map(map, 16, 16, w1, dir, rot, px, py);
          flg = F_PRC;
        }
      }

      if (F_AHD === flg) {
        if (1 === rotate(rot)) {
          dump_map(map, 16, 16, w1, dir, rot, px, py);
          dir = dir - 1 < 0 ? 3 : dir - 1;
          dump_map(map, 16, 16, w2, dir, rot, px, py);
          flg = F_ROT;
        }
      }

      if (F_ERR === flg) {
        console.log('error');
        clearInterval(iid);
        return;
      }

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      draw_wall(w1, drw);
      draw_wall(w2, drw);

      //draw_minimap();

    }, 50);

  }

}