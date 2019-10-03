/*
 *
 */

const POC_FLAG = 1;
const MOV_NEXT = 1;
const ROT_NEXT = 1;

window.onload = () => {
  const ctx = document.createElement('canvas').getContext('2d');

  // enums


  const ROT = 1; // (st)
  const MOV = 2; // (st)


  // conctants

  const subcolumns_num = 4;
  const subrows_num = 6;
  const subrows_num_HALF = Math.ceil(subrows_num / 2) - 1;

  const wx = 300;            // window width (can be changed in runtime without harm)
  const wy = 100;            // window height
  const cn = 6;              // columns number
  const details_reduction = 0; // skips column details from further (zero or more)
  const cx = [...Array(cn)]; // column x positions
  cx[0] = 0;
  cx[cn - 1] = wx / 2;
  for (let i = 1; i < cn - 1; ++i) {
     cx[i] = cx[i - 1] + (wx >> (i + 1)); // good when cn < 36 and all columns are walls corners
    //cx[i] = cx[i - 1] + (wx / i / i); //Math.pow(wx, 1.5 / (i + 1));
  }
  const rs = wx / 50.0;    // rotation speed (pixel per frame)
  const ms = 50;           // move speed (frame per second)
  const ad = wx / wy / ms; // acceleration delta
  let ac = 1;              // current acceleration
  let st = 0;              // drawing status
  let mx = 1;              // mirror (+1:no, -1:yes)
  let dx = 0;              // offset (changes on rotation)


  // functions (uses constants)


  const define_wall = (middot_speed) => ({
    ma: [...Array(3)].map(_ => [...Array(cn)].fill(0)), // visible part of map (dumped map)
    pa: middot_speed,
    // TODO: do not define last columns subcolumns
    cl: [...Array(cn)].map(_ => ({ subcolumns: [...Array(subcolumns_num)].map(_ => ({ points: [...Array(subrows_num_HALF)].map(_ => ({})) })) })), // columns by left
    cr: [...Array(cn)].map(_ => ({ subcolumns: [...Array(subcolumns_num)].map(_ => ({ points: [...Array(subrows_num_HALF)].map(_ => ({})) })) }))  // columns by right
    // Some properties defined in 'reset_main_wall' and 'reset_side_wall'.
  });


  const reset_main_wall = (w1) => {
    w1.lx = 0;      // position left
    w1.ly = 0;
    w1.rx = wx;     // position right
    w1.ry = 0;
    w1.ox = wx / 2; // position center
    w1.oy = wy / 2;
    w1.px = wx / 2; // pointer (middot)
    w1.py = wy / 2;

    for (let i = 0; i < cn; ++i) {

      // ===== column by left ========

      w1.cl[i].x  = cx[i];
      w1.cl[i].y  = cx[i] * wy / wx;
      w1.cl[i].dx = 0;
      w1.cl[i].dy = w1.cl[i].y;
      w1.cl[i].sx = -1; // MUST BE -1 (see if-statement on 'move')
      if (i > 0) {
        w1.cl[i].dx = w1.cl[i - 1].x;
        w1.cl[i].sx = (w1.cl[i - 1].x - w1.cl[i].x) / ms;
      }
      w1.cl[i].sy = w1.cl[i].sx * wy / wx;

      // ===== column by right ======

      w1.cr[i].x  = -w1.cl[i].x; // column positions
      w1.cr[i].y  =  w1.cl[i].y;
      w1.cr[i].dx = -w1.cl[i].dx; // door positions
      w1.cr[i].dy =  w1.cr[i].y;
      // Don't worry about these parameters.
      // sx, sy (speed) used only in 'move' function
      // and can be replaced by left column's sx and sy.
      // w1.cr[i].sx = -w1.cl[i].sx;
      // w1.cr[i].sy =  w1.cl[i].sy;

      // ====== subcolumns ======

      if (i + 1 > cn - 1) break; // last column subcolumns doesn't exists

      let column_w = cx[i + 1] - cx[i];
      const subcolumn_w = column_w / (subcolumns_num + 1);

      let acc_x = cx[i]; // default previous x position (accumulator)

      for (let k = 0; k < subcolumns_num; ++k) {
        // left subcolumns
        const sL = w1.cl[i].subcolumns[k];
        acc_x += subcolumn_w;
        sL.x  = acc_x;
        // TIP: You also can do this:
        //      `if (k === 0) sL.x += subcolumn_offset;`
        //      where `subcolumn_offset = subcolumn_w * DELTA;`, DELTA can be [0; 1).
        //      Adds offset to subcolumns and makes they more perspective.
        sL.y  = sL.x * wy / wx; // y position
        sL.sx = 0; if (i > 0) sL.sx = (w1.cl[i - 1].subcolumns[k].x - sL.x) / ms;
        sL.sy = sL.sx * wy / wx;

        // right subcolumns
        const sR = w1.cr[i].subcolumns[k];
        sR.x = -sL.x;
        sR.y = +sL.y;
        // As right columns, right subcolumns uses
        // left subcolumn speed parameters to move.
        // No need to define sx and sy.

        // points (p.x ALWAYS same as sL.x)

        const sLPh = (wy - sL.y * 2) / subrows_num; // left subcolumn points height (sLPh same as sRPh)

        for (let t = 0; t < subrows_num_HALF; ++t) {
          const pL = sL.points[t];
          pL.y  = sL.y + sLPh * (t + 1);
          pL.sy = 0; if (i > 0) pL.sy = (w1.cl[i - 1].subcolumns[k].points[t].y - pL.y) / ms;

          sR.points[t].y  = +pL.y;
          sR.points[t].sy = +pL.sy; // no need to define?
        }
      }
    }
  }


  const reset_side_wall = (w2, w1) => {
    w2.lx = -wx;
    w2.ly =  0;
    w2.rx =  0;
    w2.ry =  0;
    w2.ox = -1;
    w2.oy =  wy / 2;
    w2.px = -wx / 2;
    w2.py =  0;

    for (let i = 0; i < cn; ++i) {
      w2.cl[i].x  = w2.lx;
      w2.cl[i].y  = w1.cl[i].y;
      w2.cl[i].dx = 0;
      w2.cl[i].dy = 0;
      // w2.cl[i].sx = 0; // TIP: side wall will never take part on moving.
      // w2.cl[i].sy = 0;

      w2.cr[i].x  = -1;
      w2.cr[i].y  = w1.cl[i].y;
      w2.cr[i].dx = 0;
      w2.cr[i].dy = 0;
      // w2.cr[i].sx = 0; // TIP: side wall will never take part on moving.
      // w2.cr[i].sy = 0;

      // ====== subcolumns (ABSOLUTELY SAME AS reset_main_wall) ======

      if (i + 1 > cn - 1) break; // last column subcolumns doesn't exists

      let column_w = cx[i + 1] - cx[i];
      const subcolumn_w = column_w / (subcolumns_num + 1);

      let acc_x = cx[i]; // default previous x position (accumulator)

      for (let k = 0; k < subcolumns_num; ++k) {
        // left subcolumns
        const sL = w2.cl[i].subcolumns[k];
        acc_x += subcolumn_w;
        sL.x  = acc_x;
        // TIP: You also can do this:
        //      `if (k === 0) sL.x += subcolumn_offset;`
        //      where `subcolumn_offset = subcolumn_w * DELTA;`, DELTA can be [0; 1).
        //      Adds offset to subcolumns and makes they more perspective.
        sL.y  = sL.x * wy / wx; // y position
        sL.sx = 0; if (i > 0) sL.sx = (w2.cl[i - 1].subcolumns[k].x - sL.x) / ms;
        sL.sy = sL.sx * wy / wx;

        // right subcolumns
        const sR = w2.cr[i].subcolumns[k];
        sR.x = -sL.x;
        sR.y = +sL.y;
        // As right columns, right subcolumns uses
        // left subcolumn speed parameters to move.
        // No need to define sx and sy.

        // points (p.x ALWAYS same as sL.x)

        const sLPh = (wy - sL.y * 2) / subrows_num; // left subcolumn points height (sLPh same as sRPh)

        for (let t = 0; t < subrows_num_HALF; ++t) {
          const pL = sL.points[t];
          pL.y  = sL.y + sLPh * (t + 1);
          pL.sy = 0; if (i > 0) pL.sy = (w2.cl[i - 1].subcolumns[k].points[t].y - pL.y) / ms;

          sR.points[t].y  = +pL.y;
          sR.points[t].sy = -pL.sy; // no need to define?
        }
      }
    }
  }


  // initialization


  const w1 = define_wall(-(wy / wx / 2.0) * rs);
  const w2 = define_wall(-w1.pa);
  reset_main_wall(w1);
  reset_side_wall(w2, w1);


  const draw_line = (x1, y1, x2, y2, color) => {
    if (!color) {
      color = ctx.createLinearGradient(x1, y1, x2, y2);
      color.addColorStop(0, "red");
      color.addColorStop(1, "blue");
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }



  const draw_brickwall = (TLx, TLy, TRx, TRy, BLx, BLy, BRx, BRy, color) => {
    // L === N (left === near)
    // R === F (right === far)

    // top line
    draw_line(TLx, TLy, TRx, TRy);

    // bottom line
    draw_line(BLx, BLy, BRx, BRy);
    /*
    const rows_num = 4;
    const cols_num = 3;

    const Lh = BLy - TLy;
    const Rh = BRy - TRy;

    const w = TRx - TLx; // same as BRx - BLx



    // horisontal lines (rows_num)
    for (let i = 1; i < rows_num; ++i) {

      draw_line(TLx, TLy + Lh / rows_num * i, TRx, TRy + Rh / rows_num * i, color);

    }



    // vertical lines (cols_num)
    for (let i = 1; i < cols_num; ++i) {

      const x = TLx + w / cols_num * i;
      const y1 = x * wy / wx;
      const y2 = wy - y1;

      draw_line(x, y1, x, y2, color);

    }
    */

  }


  // uses 'cvt_column2arr'
  // drw: function (x1, y1, x2, y2, depth)
  const draw_wall = (w, drw) => {

    ctx.save();
    ctx.translate(100, 100);

    // TODO: (!!! IN DEV !!!)
    const maoff = 0; // dumped map offset

    let d = [...Array(8)];
    let c = [...Array(8)];
    let o = [...Array(8)];

    for (let i = 0; i < cn; ++i) {

      // do not draw last column subcolumns, they are not initialized
      if (i < cn - 1 - details_reduction && (i > 0 || st !== MOV)) {
        // subcolumns
        for (let k = 0; k < subcolumns_num; ++k) {
          // left subcolumn
          const sL = w.cl[i].subcolumns[k];
          const sLLx = (sL.x + w.lx) * mx + dx;
          const sLLy =  sL.y;
          const sLRx =  sLLx;
          const sLRy =  wy - sLLy;

          draw_line(sLLx, sLLy, sLRx, sLRy, 'green');

          // right subcolumn
          const sR = w.cr[i].subcolumns[k];
          const sRLx = (sR.x + w.rx) * mx + dx; // TIP: used w.rx instead of w.lx, be attentive
          const sRLy =  sR.y;
          const sRRx =  sRLx;
          const sRRy =  wy - sRLy;

          draw_line(sRLx, sRLy, sRRx, sRRy, 'blue');

          // points

          for (let k = 0; k < subrows_num_HALF; ++k) {
            const pL = sL.points[k];
            ctx.fillStyle = 'white';
            ctx.fillRect(sLLx, pL.y, 5, 5);

            const pR = sR.points[k];
            ctx.fillStyle = 'yellow';
            ctx.fillRect(sRRx, pR.y, 5, 5);
          }
        }
      }

      // left column [x,y,x,y]
      c[0] = (w.cl[i].x + w.lx) * mx + dx;
      c[1] =  w.cl[i].y;
      c[2] =  c[0];
      c[3] =  wy - c[1];

      // right column [x,y,x,y]
      c[4] = (w.cr[i].x + w.rx) * mx + dx;
      c[5] =  w.cr[i].y;
      c[6] =  c[4];
      c[7] =  wy - c[5];

      // left door [x,y,x,y]
      d[0] = (w.cl[i].dx + w.lx) * mx + dx;
      d[1] =  w.cl[i].dy;
      d[2] =  d[0];
      d[3] =  wy - d[1];

      // right door [x,y,x,y]
      d[4] = (w.cr[i].dx + w.rx) * mx + dx;
      d[5] =  w.cr[i].dy;
      d[6] =  d[4];
      d[7] =  wy - d[5];

      // vertical lines (need only when rotating, but who cares?)
      drw(c[0], c[1], c[2], c[3], i);
      drw(c[4], c[5], c[6], c[7], i);

      // draws columns on sides
      if (i > 0) { // after first iteration

        // left wall
        if (w.ma[0][i - 1 + maoff] === 1) {
          draw_brickwall(o[0], o[1], c[0], c[1], o[2], o[3], c[2], c[3], 'blue');
        }
        // left door
        else {
          drw(d[0], d[1], c[0], c[1], i);
          drw(d[2], d[3], c[2], c[3], i);
        }
        // right wall
        if (w.ma[2][i - 1 + maoff] === 1) {
          drw(c[4], c[5], o[4], o[5], i);
          drw(c[6], c[7], o[6], o[7], i);
        }
        // right door
        else {
          drw(d[4], d[5], c[4], c[5], i);
          drw(d[6], d[7], c[6], c[7], i);
        }
      }

      // wall in front
      if (w.ma[1][i + maoff] === 1) {
        drw(c[0], c[1], c[2], c[3], i); // |
        drw(c[4], c[5], c[6], c[7], i);
        drw(c[0], c[1], c[4], c[5], i); // _
        drw(c[2], c[3], c[6], c[7], i);
        //return; // no need to draw other ones
      }

      // swap buffers
      [o, c] = [c, o];
    }

    // "X" in the end of room (only while moving)
    if (st === MOV) {
      drw(o[0], o[1], w.ox * mx + dx, w.oy, cn);
      drw(o[2], o[3], w.ox * mx + dx, w.oy, cn);
      drw(o[4], o[5], w.ox * mx + dx, w.oy, cn);
      drw(o[6], o[7], w.ox * mx + dx, w.oy, cn);
    }


    ctx.fillStyle = 'red';
    ctx.fillRect(w1.ox, w1.oy, 2, 2);


    ctx.fillStyle = 'blue';
    ctx.fillRect(w1.rx, w1.ry, 10, 10);
    ctx.fillRect(w1.rx, wy - w1.ry, 10, 10);


    ctx.restore();
  }


  // uses 'reset_main_wall'
  function move(w1) {
    // setup
    if (st !== MOV) {
      st = MOV;
      ac = 1;
    } else if (w1.cl[0].x <= 3 - ms) { // MUST BE <= 3, because cl[0].sx == -1
      st = 0;
      reset_main_wall(w1);
      return 1; // over
    }

    ac += ad; // moving

    for (let i = 0; i < cn; ++i) {
      w1.cl[i].x +=  w1.cl[i].sx * ac;
      w1.cl[i].y +=  w1.cl[i].sy * ac;
      w1.cl[i].dx =  0; if (i > 0) w1.cl[i].dx = w1.cl[i - 1].x;
      w1.cl[i].dy =  w1.cl[i].y;

      w1.cr[i].x -=  w1.cl[i].sx * ac; // same as w1.cr[i].sx * ac;
      w1.cr[i].y +=  w1.cl[i].sy * ac; // same as w1.cr[i].sy * ac;
      w1.cr[i].dx = -w1.cl[i].dx;
      w1.cr[i].dy =  w1.cr[i].y;

      // ---- subcolumns ------

      // do not draw last column subcolumns, they are not initialized
      if (i < cn - 1 - details_reduction) {
        for (let k = 0; k < subcolumns_num; ++k) {
          w1.cl[i].subcolumns[k].x += w1.cl[i].subcolumns[k].sx * ac;
          w1.cl[i].subcolumns[k].y += w1.cl[i].subcolumns[k].sy * ac;

          w1.cr[i].subcolumns[k].x -= w1.cl[i].subcolumns[k].sx * ac;
          w1.cr[i].subcolumns[k].y += w1.cl[i].subcolumns[k].sy * ac;

          // points
          for (let t = 0; t < subrows_num_HALF; ++t) {
            w1.cl[i].subcolumns[k].points[t].y += w1.cl[i].subcolumns[k].points[t].sy * ac;
            w1.cr[i].subcolumns[k].points[t].y += w1.cr[i].subcolumns[k].points[t].sy * ac;
          }
        }
      }
    }

    return 0; // moving cycle not over
  }




  const intersection = (x1, y1, x2, y2, x3, y3, x4, y4) => {
    const d12 = x1 * y2 - y1 * x2;
    const d34 = x3 * y4 - y3 * x4;
    const d14 = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    return {
      x: (d12 * (x3 - x4) - d34 * (x1 - x2)) / d14,
      y: (d12 * (y3 - y4) - d34 * (y1 - y2)) / d14,
    }
  }


  // uses 'intersection', 'reset_main_wall', 'reset_side_wall'
  const rotate = (side, w1, w2) => {
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
      reset_main_wall(w1);
      reset_side_wall(w2, w1);
      return 1; // over
    }

    // applies offset

    w1.rx += rs;
    w1.lx += rs;
    w1.px += rs;
    w1.py += w1.pa;

    w2.rx += rs;
    w2.lx += rs;
    w2.px += rs;
    w2.py += w2.pa;

    w1.ox = w1.lx + (w1.oy - w1.ly) * (w1.px - w1.lx) / (w1.py - w1.ly);
    w2.ox = w2.rx + (w2.oy - w2.ry) * (w2.px - w2.rx) / (w2.py - w2.ry);

    w1.ry = w1.rx / (w2.ox - w1.lx) * (w2.oy - w1.ly);
    w2.ly = w2.lx / (w1.ox - w2.rx) * (w1.oy - w2.ry);

    // redefines columns
    let I = null; // intersection buffer
    for (let i = 0; i < cn; ++i) {

      // You MUST calculate intersections after w.px > wx because
      // you need calculated values to draw deadend (front) columns.

      // скорее всего здесь тоже можно избавиться от intersection, как это сделано в subcolumns

      // main wall column
      w1.cl[i].x = w1.cl[i].y * (w1.ox - w1.lx) / (w1.oy - w1.ly);
      I = intersection(w1.rx, w1.ry, w1.ox, w1.oy,
                       w1.cl[i].x + w1.lx, w1.cl[i].y, w2.ox, w2.oy);
      w1.cr[i].x = I.x - w1.rx;
      w1.cr[i].y = I.y;

      // side wall column
      w2.cr[i].x = w2.cr[i].y * (w2.ox - w2.rx) / (w2.oy - w2.ry);
      I = intersection(w2.lx, w2.ly, w2.ox, w2.oy,
                       w2.cr[i].x + w2.rx, w2.cr[i].y, w1.ox, w1.oy);
      w2.cl[i].x = I.x - w2.lx;
      w2.cl[i].y = I.y;

      // HACK: to delete bugged door lines from screen in the end of rotation. (???)
      if (w1.cl[i].x < -wx) w1.cl[i].x = 0;
      if (w1.cr[i].x < -wx) w1.cr[i].x = 0;

      // TODO: you dont need calculate subcolumns if there is a door (do check w.ma)

      // do not draw last column subcolumns, they are not initialized
      if (i < cn - 1 - details_reduction) {

        // main wall subcolumns

        const sRw = (w1.cr[i + 1].x - w1.cr[i].x) / (subcolumns_num + 1); // right subcolumn width
        let sR_prev_x = w1.cr[i].x; // right subcolumn previous x position (accumulator)

        for (let k = 0; k < subcolumns_num; ++k) {
          // left subcolumn
          const sL = w1.cl[i].subcolumns[k];
          sL.x = sL.y * (w1.ox - w1.lx) / (w1.oy - w1.ly);

          // right subcolumn (you can do it with intersection -- slower but lighter)
          const sR = w1.cr[i].subcolumns[k];
          sR.x = sR_prev_x + sRw;
          const W0 = w1.rx - w1.ox;
          let W1 = W0 + sR.x; if (W1 < 0) W1 = 0;
          sR.y = w1.oy - (w1.oy - w1.ry) * W1 / W0;
          sR_prev_x = sR.x;

          // right subcolumn points

          const sRPh = (wy - sR.y * 2) / subrows_num; // right subcolumn point height
          let sRP_prev_y = sR.y; // accumulator

          for (let t = 0; t < subrows_num_HALF; ++t) {
            sRP_prev_y += sRPh; // increase acc first
            sR.points[t].y = sRP_prev_y; // right points (left column y'es not changing)
          }
        }

        // side wall subcolumns (inverse calculations)

        const sLw = (w2.cl[i + 1].x - w2.cl[i].x) / (subcolumns_num + 1); // left subcolumn width
        let sL_prev_x = w2.cl[i].x; // left subcolumn previous x position (accumulator)

        for (let k = 0; k < subcolumns_num; ++k) {
          // left subcolumn
          const sL = w2.cl[i].subcolumns[k];
          sL.x = sL_prev_x + sLw;
          const W0 = w2.lx - w2.ox;
          const W1 = W0 + sL.x;
          sL.y = w1.oy - (w2.oy - w2.ly) * W1 / W0;
          sL_prev_x = sL.x;

          // right subcolumn
          const sR = w2.cr[i].subcolumns[k];
          sR.x = sR.y * (w2.ox - w2.rx) / (w2.oy - w2.ry);

          // left subcolumn points (inverse calculations) (probably could do without inverse)

          const sLPh = (wy - sL.y * 2) / subrows_num;
          let sLP_prev_y = sL.y;

          for (let t = 0; t < subrows_num_HALF; ++t) {
            sLP_prev_y += sLPh;
            sL.points[t].y = sLP_prev_y;
          }
        }
      }

      // doors

      if (i > 0) {
        const u = i - 1;

        // TODO: you dont need calculate dx, dy if there is no doors (do check w.ma)



          // main wall left
          I = intersection(w1.cl[u].x, w1.cl[u].y, w1.cl[u].x, wy - w1.cl[u].y,
                           w1.cl[i].x, w1.cl[i].y, w2.ox - w1.lx, w2.oy - w1.ly);
          w1.cl[i].dx = I.x;
          w1.cl[i].dy = I.y;



          // main wall right
          I = intersection(w1.cr[u].x, w1.cr[u].y, w1.cr[u].x, wy - w1.cr[u].y,
                           w1.cr[i].x, w1.cr[i].y, w2.ox - w1.lx, w2.oy - w1.ly);
          w1.cr[i].dx = I.x;
          w1.cr[i].dy = I.y;



          // side wall left
          I = intersection(w2.cl[u].x, w2.cl[u].y, w2.cl[u].x, wy - w2.cl[u].y,
                           w2.cl[i].x, w2.cl[i].y, w1.ox - w2.rx, w1.oy - w2.ry);
          w2.cl[i].dx = I.x;
          w2.cl[i].dy = I.y;



          // side wall right
          I = intersection(w2.cr[u].x, w2.cr[u].y, w2.cr[u].x, wy - w2.cr[u].y,
                           w2.cr[i].x, w2.cr[i].y, w1.ox - w2.rx, w1.oy - w2.ry);
          w2.cr[i].dx = I.x;
          w2.cr[i].dy = I.y;


      }



    }

    return 0; // rotation cycle not over
  }


  // creates dump of game map according to:
  //    game map:   map, mapw, maph -- mat2, width, height
  //    wall:       w               -- w1 or w2
  //    direction:  d               -- 0:up, 1:right, 2:down, 3:left
  //    rotation:   r               -- +1:left, -1:right
  //    position:   x, y            -- unsigned int
  const dump_map = (map, mapw, maph, w, d, r, x, y) => {
    let mmx = x;
    let mmy = y;
    let dx1 = 0;
    let dy1 = 0;
    let dx2 = 0;
    let dy2 = 0;
    switch(d) {
      case 0: mmx -= r; mmy -= 1; dy1 = -1; dx2 =  r; break;
      case 1: mmx += 1; mmy -= r; dx1 =  1; dy2 =  r; break;
      case 2: mmx += r; mmy += 1; dy1 =  1; dx2 = -r; break;
      case 3: mmx -= 1; mmy += r; dx1 = -1; dy2 = -r; break;
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


  const copy_map = () => {
    for (let y = 0; y < 3; ++y)
      for (let x = 0; x < cn; ++x)
        w1.ma[y][x] = w2.ma[2 - y][x];
  }


  // demoscene


  const demo = (ctx) => {
    const colors = [...Array(cn)].map((_, i) => {
      const c = (255 - 213 / cn * i) / (i + 1) | 0;
      return `rgb(${c}, ${c}, ${c})`;
    });

    const map = [...Array(16)].map((_,y) => [...Array(16)].map((_,x) =>
      ('翿䁁坝儑啕䐁啽䄁啷儑嗕䐑坵儅翿'.charCodeAt(y) >> x) & 1));

    let px  = 7; // camera position
    let py  = 6;
    let dir = 0; // 0: top, 1: right, 2: down, 3: left
    let rot = 1; // left(forward): -1, right: +1

    dump_map(map, 16, 16, w1, dir, rot, px, py);

    // enums
    const F_PRC = 0; // (flg) camera in cell (waits for new command)
    const F_MOV = 1; // (flg) camera moving
    const F_ROT = 2; // (flg) camera rotating
    const F_AHD = 3; // (flg) camera in deadend (must rotate 2 times)


    // randomly rotates camera
    const next_dir = () => {
      // possible directions
      const d = ((map[px + 0][py - 1] === 0) << 0) | // ^
                ((map[px + 1][py + 0] === 0) << 1) | // >
                ((map[px + 0][py + 1] === 0) << 2) | // v
                ((map[px - 1][py + 0] === 0) << 3) ; // <

      const b = (dir + 2) % 4;
      let nd = dir + (Math.random() * 4 | 0);
      for (let i = 0; i < 4; ++i) {
        nd %= 4;
        if (nd !== b && ((d >> nd) & 1))
          return {
            rot: ((nd + 1) % 4) === dir ? +1 : -1,
            dir: nd,
            flg: F_ROT,
          };
        ++nd;
      }

      return {
        rot: Math.random() * 2 | 0 ? -1 : 1,
        dir: dir - 1 < 0 ? 3 : dir - 1,
        flg: F_AHD,
      }
    }


    const draw_minimap = () => {
      ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
      for (let y = 0; y < 16; ++y)
        for (let x = 0; x < 16; ++x)
          if (map[x][y])
            ctx.fillRect(220 + x * 5, 5 + y * 5, 4, 4);
      ctx.fillStyle = 'rgba(250, 250, 250, 0.5)';
      ctx.fillRect(220 + px * 5, 5 + py * 5, 4, 4);
    }


    const draw_line = async (x1, y1, x2, y2, depth) => {
      ctx.strokeStyle = colors[depth];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }


    let flg = POC_FLAG; //1000;//F_ROT;//F_PRC; // default F_ROT; // F_MOV; //


    const FPS = 60; // frames per second
    const MSPF = 1000 / FPS; // milliseconds per frame
    let prev_timestamp = 0;

      setInterval(() => {
        // camera in cell (waits for new command)
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

        // camera rotating
        if (F_ROT === flg) {
          if (1 === rotate(rot, w1, w2)) {
            rot = 1;
            dump_map(map, 16, 16, w1, dir, rot, px, py);
            flg = ROT_NEXT;
            //flg = F_ROT;
            //flg = F_MOV;
            //flg = 1000;
          }
        }

        // camera moving
        if (F_MOV === flg) {
          if (1 === move(w1)) {
            switch (dir) {
              case 0: py--; break;
              case 1: px++; break;
              case 2: py++; break;
              case 3: px--; break;
            }
            dump_map(map, 16, 16, w1, dir, rot, px, py);
            flg = MOV_NEXT;
            //flg = F_PRC;
            //flg = 1000;
          }
        }

        // camera in deadend (must rotate 2 times)
        if (F_AHD === flg) {
          if (1 === rotate(rot, w1, w2)) {
            dump_map(map, 16, 16, w1, dir, rot, px, py);
            dir = dir - 1 < 0 ? 3 : dir - 1;
            dump_map(map, 16, 16, w2, dir, rot, px, py);
            flg = F_ROT;
          }
        }

        // drawing
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        draw_wall(w1, draw_line);
        if (F_ROT === flg) {
          draw_wall(w2, draw_line);
        }
      }, 100);

  }


  // starts demoscene



  document.body.appendChild(ctx.canvas);
  ctx.canvas.width  = 600; // wx;
  ctx.canvas.height = 500; // wy;
  demo(ctx);
}
