window.onload = function() {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.height = 600;
  ctx.canvas.width = 800;
  document.body.appendChild(ctx.canvas);
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const rg = RoomGenerator(10, 3, 0.2, 0.8, 0.6, 0.9, new Math.seedrandom('1'));
  ctx.translate(20, 20);
  rg.draw(ctx, 4, 8, 50);
  ctx.translate(600, 0);
  rg.draw_scheme(ctx);



  // squeeze

  // const rooms = [];
  // {
  //   const scaler = 0.1;

  //   for (let r of rg.rects) {

  //     let room = null;

  //     if ('gaps' in r) {

  //       room = [];

  //       room.lines = [];

  //       r.gaps.T.map(e => [e[0]+scaler, e[1]+scaler, e[2]-scaler, e[3]+scaler]);
  //       r.gaps.L.map(e => [e[0]+scaler, e[1]+scaler, e[2]+scaler, e[3]-scaler]);
  //       r.gaps.R.map(e => [e[0]-scaler, e[1]+scaler, e[2]-scaler, e[3]-scaler]);
  //       r.gaps.B.map(e => [e[0]+scaler, e[1]-scaler, e[2]-scaler, e[3]-scaler]);



  //     }

  //     rooms.push(room);
  //   }
  // }


  ctx.translate(-50, 200);
  ctx.lineWidth = 1;
  ctx.strokeStyle = ctx.fillStyle = `white`;
  const scaler = 15;
  const S1 = 0;
  const S2 = 0;
  for (let r of rg.rects) {
    if ('gaps' in r) {
      ctx.fillText(r.index, r[0] * scaler + S1 + 5, r[1] * scaler + S1 + 14);

      r.gaps.T.forEach(e => draw_gap(e, [+S1, +S1, -S1, +S1]));
      r.gaps.L.forEach(e => draw_gap(e, [+S1, +S1, +S1, -S1]));
      r.gaps.R.forEach(e => draw_gap(e, [-S1, +S1, -S1, -S1]));
      r.gaps.B.forEach(e => draw_gap(e, [+S1, -S1, -S1, -S1]));
      // ctx.strokeRect(r[0] * scaler + S2, r[1] * scaler + S2, r[2] * scaler - S2 * 2, r[3] * scaler - S2 * 2);
    }
  }
  function draw_gap(e, a) {
    ctx.beginPath();
    ctx.moveTo(e[0] * scaler + a[0], e[1] * scaler + a[1]);
    ctx.lineTo(e[2] * scaler + a[2], e[3] * scaler + a[3]);
    ctx.stroke();
  }




}
