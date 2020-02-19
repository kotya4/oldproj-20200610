const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

window.addEventListener('load', () => {
  const ctx = canvas(100, 100);

  const tri = [
    [0.0, 0.0, 0.0],
    [0.0, 1.0, 0.0],
    [1.0, 1.0, 0.0],
  ];

  const pmat = mat4.create();
  mat4.perspective(pmat, Math.PI / 4, ctx.canvas.width / ctx.canvas.height, 0.1, 100);
  mat4.translate(pmat, pmat, [0, 0, -10]);

  const vmat = mat4.create();

  setInterval(() => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = 'red';
    ctx.fillText('hello, 3d', 10, 10);

    ctx.fillStyle = 'white';
    ctx.beginPath();
    for (let i = 0; i < tri.length; ++i) {
      let pos2 = to_pos2(tri[i], vmat, pmat, ctx.canvas.width, ctx.canvas.height);
      if (i === 0) ctx.moveTo(...pos2); else ctx.lineTo(...pos2);
    }
    ctx.fill();

    mat4.translate(vmat, vmat, [+0.5, +0.5, +0.0]);
    mat4.rotateX(vmat, vmat, +0.100);
    mat4.rotateZ(vmat, vmat, +0.050);
    mat4.translate(vmat, vmat, [-0.5, -0.5, -0.0]);
  }, 100);

});

function canvas(w, h) {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = w;
  ctx.canvas.height = h;
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, w, h);
  document.body.appendChild(ctx.canvas);
  return ctx;
}

function to_pos2(pos3, vmat, pmat, w, h) {
  const tpos3 = vec3.create();
  vec3.transformMat4(tpos3, pos3, vmat);
  vec3.transformMat4(tpos3, tpos3, pmat);
  tpos3[0] /= tpos3[2];
  tpos3[1] /= tpos3[2];
  return [
    (tpos3[0] + 1) * w / 2,
    (tpos3[1] + 1) * h / 2,
  ];
}
