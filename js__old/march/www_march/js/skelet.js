Includer().include('www_march/js/', [
  'canvas2d.js',
  'webgl.js',
  'Graphics.js',
  'Voxelmap2.js',
]).then(function () {


  const size = 20;
  const voxelmap = Voxelmap2(size, size, size);


  let a = 1.0;
  let b = 1.0;
  let c = 1.0;
  let r = (size / 2) ** 2;
  let s = +1; // sign

  let ox = size / 2 - 0.5;
  let oy = size / 2 - 0.5;
  let oz = size / 2 - 0.5;


  const graphics = Graphics({
    x: -size / 2,
    y: -size / 2,
    z: -60,
    origin: [size / 2, size / 2, size / 2],
    rotation: [0.5, -0.8, 0.0],
  });

  // hyperboloid

  graphics.vbo_setter(elapsed => {
    // sina += 0.01;

    // voxelmap.for_each((v, x, y, z, map, w, h, d) => {
    //   map[z][y][x] = Math.sin(x)// + Math.sin(1) + Math.sin(0.5);
    // });

    voxelmap.hyperboloid(10, -1, +0.5, +0.5, +1, -1);

    const mesh = voxelmap.generate_mesh();
    graphics.ctx.clearRect(0, 0, graphics.ctx.canvas.width, graphics.ctx.canvas.height);
    graphics.ctx.fillStyle = 'white';
    graphics.ctx.font = '14px "Arial"';
    graphics.ctx.fillText('faces: ' + String(mesh.coord.length / 3 / 3), 30, 30);
    graphics.ctx.fillText([a, b, c, r].map(e => ~~(e * 100) / 100), 30, 60);
    return mesh;
  });



});
