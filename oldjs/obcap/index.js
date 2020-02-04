// obcap
window.onload = function () {

  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.height = 512;
  ctx.canvas.width = 720;
  document.body.appendChild(ctx.canvas);

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

/*

  ctx.translate(20, ctx.canvas.height / 2);



  ctx.strokeStyle = 'pink';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(ctx.canvas.width, 0);
  ctx.stroke();


  ctx.strokeStyle = ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  const scaler = 100;
  const step = 1;

  let oldx = 0;
  let oldy = 0;
  for (let angle = step; angle <= Math.PI * 2.5; angle += step) {
    const x = +scaler * angle;
    const y = -scaler * Math.sin(angle);

    const len = Math.sqrt((x - oldx) ** 2 + (y - oldy) ** 2);

    ctx.lineTo(x, y);
    ctx.fillText((len * 100 | 0) / 100, x, y);
    oldx = x;
    oldy = y;
  }

  ctx.stroke();


*/

  let sangle_mod = 0.01;
  let inner_radius = 0;
  let step_mod = 1;
  const step_mod_max = 0.01;
  const inner_scaler = 1;


  let mod_1 = 0;
  let mod_2 = 0;

  setInterval(() => {

    sangle_mod += 0.0001;
    inner_radius += 0.001;
    //mod_1 += 0.01;
    //mod_2 += 0.1;
    step_mod /= 1.001
    ctx.save();

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);


    // volume

    const step = step_mod > step_mod_max ? step_mod : step_mod_max;
    const scaler = 100;
    const nscaler = 1;
    ctx.strokeStyle = ctx.fillStyle = 'red';
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.beginPath();

    let soldx = 0;
    let soldy = 0;
    let sangle = 0;
    const sscaler = 30;
    for (let angle = 0; angle <= Math.PI * 2; angle += step) {
      sangle += sangle_mod;

      const aa= 1;//(Math.cos(mod_1) + 2) / 2;

      const x = (Math.sin(sangle) **(aa) + Math.cos(inner_radius) * inner_scaler) * (scaler) * Math.sin(angle)**1;
      const y = (Math.cos(sangle) **(aa) + Math.cos(inner_radius) * inner_scaler) * (scaler) * Math.cos(angle)**1;

      ctx.lineTo(x, y);

    }
    ctx.stroke();

    ctx.restore();

  }, 10);







}
