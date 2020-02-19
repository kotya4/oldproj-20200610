//
window.onload = async () => {
  await Fixedsys8x12.demo();

  // const display_height = 300;
  // const display_width = 640;

  // const ctx = document.createElement('canvas').getContext('2d');
  // document.body.appendChild(ctx.canvas);
  // ctx.canvas.height = display_height + 192;
  // ctx.canvas.width = display_width + 100;
  // ctx.imageSmoothingEnabled = false;

  // ctx.strokeStyle = 'blue';
  // ctx.lineWidth = 2;
  // const lines = [];
  // for (let i = 0; i < 1000; ++i) {
  //   const points_x = [0, 0].map(_ => Math.random() * display_width);
  //   const points_y = [0, 0].map(_ => Math.random() * display_height);
  //   lines.push([points_x[0], points_y[0], points_x[1], points_y[1]]);
  //   ctx.beginPath();
  //   ctx.moveTo(points_x[0], points_y[0]);
  //   ctx.lineTo(points_x[1], points_y[1]);
  //   //ctx.stroke();
  // }
  // const fixedsys = await Fixedsys8x12(80, 25);
  // console.time('time2');
  // lines.forEach(e => fixedsys.liner.stroke(...e, true));
  // console.timeEnd('time2');
  // fixedsys.screen.flush(ctx);

  // const fixedsys = await Fixedsys8x12(80, 25);
  // const ox = Math.random() * 100 + 100;
  // const oy = Math.random() * 50 + 100;
  // window.onmousemove = (e) => {
  //   fixedsys.screen.clear();
  //   fixedsys.liner.stroke(ox, oy, e.clientX, e.clientY);
  // };
  // setInterval(() => {
  //   ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  //   fixedsys.screen.flush(ctx);
  // }, 100);

  // const lines = [];
  // for (let i = 0; i < 10; ++i) {
  //   const points_x = [0, 0].map(_ => Math.random() * display_width);
  //   const points_y = [0, 0].map(_ => Math.random() * display_height);
  //   lines.push([points_x[0], points_y[0], points_x[1], points_y[1]]);
  // }
  // const fixedsys = await Fixedsys8x12(80, 25);
  // const ox = Math.random() * 100 + 100;
  // const oy = Math.random() * 50 + 100;
  // setInterval(() => {
  //   ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  //   fixedsys.screen.clear();
  //   lines.forEach(e => fixedsys.liner.stroke(...e, false));
  //   lines.forEach(e => {
  //     e[0] += Math.random() < 0.5 ? -1 : +1;
  //     e[1] += Math.random() < 0.5 ? -1 : +1;
  //     e[2] += Math.random() < 0.5 ? -1 : +1;
  //     e[3] += Math.random() < 0.5 ? -1 : +1;
  //   });
  //   fixedsys.screen.flush(ctx);
  // }, 100);
}
