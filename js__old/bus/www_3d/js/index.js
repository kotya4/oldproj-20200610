
async function onload() {
  const wrapper = document.getElementsByClassName('wrapper')[0];

  const images = ImageList();
  await images.load('www_3d/img/', [
    'ground_0.png',
    'build/0.png',
    'build/1.png',
    'build/2.png',
    'roof/0.png',
    'roof/1.png',
    'roof/2.png',
    'ped/0.png',
    'bal/0.png',
    'bal/1.png',
  ]);

  const mat3 = glMatrix.mat3;
  const mat4 = glMatrix.mat4;

  const screen_width = 400;
  const screen_height = 400;

  const projection = mat4.create();
  mat4.perspective(projection, Math.PI / 4, screen_width / screen_height, 0.1, 1000);

  const webgl = WebGL(screen_width, screen_height, projection, wrapper);

  const textures = images.map(e => webgl.create_texture(e));

  const build_textures = [
    null,
    textures.build_0,
    textures.build_1,
    textures.build_2,
  ];

  const roof_textures = [
    null,
    textures.roof_0,
    textures.roof_1,
    textures.roof_2,
  ];

  const bal_textures = [...Array(8)].map(() => Math.random() < 0.5 ? textures.bal_0 : textures.bal_1);

  const vbo_cube = webgl.create_vbo_cube();

  const map = [
    [1, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1],
  ].map((e, x) => e.map((e, y) => e * (1 + ~~(Math.random() * 3))));

  const radius = 2.5;
  const height = 2.0;

  const tmatrix = mat3.create();

  let ped_texture_offset = 0.0;
  //setInterval(() => ped_texture_offset = (ped_texture_offset + 0.25) % 1.0, 150);

  let rotation = 0;
  setInterval(() => {
    webgl.clear();

    /*
    const modelview = mat4.create();
    mat4.translate(modelview, modelview, [0, 0, -30]);
    mat4.rotateX(modelview, modelview, Math.PI / 6);
    mat4.rotateY(modelview, modelview, rotation);
    //mat4.translate(modelview, modelview, [0, 0, 0]);
    //mat4.scale(modelview, modelview, [1.0, 1.0, 1.0]);
    vbo_cube.draw('cube', textures.build_0, modelview);
    */

    const modelview = mat4.create();
    mat4.translate(modelview, modelview, [0, 0, -13]);
    mat4.rotateX(modelview, modelview, Math.PI / 6);
    mat4.rotateY(modelview, modelview, rotation);

    for (let x = 0; x < map.length; ++x) for (let y = 0; y < map[0].length; ++y) {
      const pos = [(x - (map.length >> 1)) * radius, height, (y - (map[0].length >> 1)) * radius];

      // ground
      const mv_ground = mat4.create();
      mat4.translate(mv_ground, modelview, pos);
      mat4.scale(mv_ground, mv_ground, [radius / 2, height, radius / 2]);
      mat4.rotateX(mv_ground, mv_ground, Math.PI / 2);
      vbo_cube.draw('plate', textures.ground_0, tmatrix, mv_ground);

      if (map[x][y]) {
        // roof
        const mv_roof = mat4.create();
        mat4.translate(mv_roof, modelview, [pos[0], 3 * height, pos[2]]);
        mat4.scale(mv_roof, mv_roof, [1.0, height, 1.0]);
        mat4.rotateX(mv_roof, mv_roof, Math.PI / 2);
        vbo_cube.draw('plate', roof_textures[map[x][y]], tmatrix, mv_roof);

        // build

        const mv_build = mat4.create();
        mat4.translate(mv_build, modelview, pos);
        mat4.scale(mv_build, mv_build, [1.0, height, 1.0]);
        vbo_cube.draw('box', build_textures[map[x][y]], tmatrix, mv_build);


        // balconies
        const bal_height = 0.14;
        const bal_width = 0.2;
        const bal_y0 = 1.0;     // begin height
        const bal_offy = 0.0;   // each box offset
        const bal_offx = 0.7;
        for (let side = 0; side < 1; ++side) {
          for (let cols = 0; cols < 3; ++cols) {
            for (let rows = 0; rows < 10; ++rows) {
              //if (rows % 2) continue;
              const mv_bal = mat4.create();
              mat4.translate(mv_bal, modelview, [
                pos[0] - 0.9 + bal_width + bal_offx * cols,
                bal_y0 + rows * (bal_offy + bal_height * 2),
                pos[2] + 1.0
              ]);
              mat4.scale(mv_bal, mv_bal, [bal_width, bal_height, bal_width]);
              vbo_cube.draw('box', bal_textures[(side + cols + rows) % bal_textures.length], tmatrix, mv_bal);
            }
          }
        }

      }
    }


    // test-box
    const mv_cube = mat4.create();
    mat4.translate(mv_cube, modelview, [0.0, 0.1, 0.0]);
    mat4.scale(mv_cube, mv_cube, [0.1, 0.1, 0.1]);
    vbo_cube.draw('cube', textures.roof_0, tmatrix, mv_cube);


    // ped
    const mv_ped = mat4.create();
    // z-offset needs to be because 'plate' is actially the front of the cube with sizes 2.0,
    // so if we need plate to be centered we must offset it by z value.
    // y-offset always equals to height (y-scaling) of the model.
    mat4.translate(mv_ped, modelview, [0, 0.5, -0.25]);
    mat4.scale(mv_ped, mv_ped, [0.25, 0.5, 0.25]);
    const tm_ped = mat3.create();
    mat3.translate(tm_ped, tm_ped, [ped_texture_offset, 0.0]);
    // x-scaling must be 1.0 / num_of_tiles, and x-offset must be scaling (for animation) by that value too.
    mat3.scale(tm_ped, tm_ped, [0.25, 1.0]);
    vbo_cube.draw('plate', textures.ped_0, tm_ped, mv_ped);


    rotation += 0.005;
  }, 20);







}

/*
 * Loader
 */
((path, a) => {
  function loadjs(src, async = true) {
    return new Promise((res, rej) =>
      document.head.appendChild(Object.assign(document.createElement('script'), {
        src,
        async,
        onload: _ => res(src),
        onerror: _ => rej(src)
      }))
    )
  }
  Promise.all(a.map(e => loadjs(path + e)))
    .then(_ => window.addEventListener('load', onload))
    .catch(src => console.log(`File "${src}" not loaded`));
})
('www_3d/js/', [
  //'mat.js',
  'webgl.js',
  'image-list.js',
  'gl-matrix-min.js',
]);
