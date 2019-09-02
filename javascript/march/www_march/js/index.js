/*
 * Marching cubes
 */
window.onload = () => {
  const { mat4 } = glMatrix;

  // creating webgl
  const screen_width = 500;
  const screen_height = 500;
  const webgl = WebGL(screen_width, screen_height);
  // const vbo = WebGL.vbo_cube();
  // webgl.bind_vbo(vbo);

  const model_origin = [+0.5, +0.5, +0.5];
  const model_rotation = [+0.0, +1.0, +1.0];
  const camera_position = [-0.5, -0.5, -15.0];

  // projection matrix
  const mat_projection = mat4.create();
  mat4.perspective(mat_projection, Math.PI / 4, screen_width / screen_height, 0.1, 100.0);

  // modelview matrix
  const mat_modelview = mat4.create();

  // normal matrix
  const mat_normal = mat4.create();

  // mouse

  const mouse = [-1, -1];
  window.addEventListener('mousedown', event => {
    mouse[0] = event.clientX;
    mouse[1] = event.clientY;
  });

  window.addEventListener('mouseup', event => {
    mouse[0] = -1;
    mouse[1] = -1;
  });

  window.addEventListener('mousemove', event => {
    if (mouse[0] === -1 || mouse[1] === -1) return;
    const dx = event.clientX - mouse[0];
    const dy = event.clientY - mouse[1];

    const rotation_speed = 0.01;

    model_rotation[0] += +dy * rotation_speed;
    model_rotation[1] += +dx * rotation_speed;
    model_rotation[2] += 0;

    mouse[0] = event.clientX;
    mouse[1] = event.clientY;
  });

  // matrices stack
  const matstack = {
    stack: [],
    push(m) { this.stack.push(mat4.clone(m)); },
    pop(m) { mat4.copy(m, this.stack.pop()); },
  };

  // discrete model
  /*
  const discrete = {
    map: null,
    create(w, h, d) {
      this.map =
        [...Array(d)].map((_, z) =>
          [...Array(h)].map((_, y) =>
            [...Array(w)].map((_, x) =>
              Math.random() >= 0.5)));
      return this;
    },
    for_each(func) {
      for (let z = 0; z < this.map.length; ++z)
        for (let y = 0; y < this.map[0].length; ++y)
          for (let x = 0; x < this.map[0][0].length; ++x)
            func(this.map[z][y][x], x, y, z, this.map);
      return this;
    },
    sizes() {
      return [this.map[0][0].length, this.map[0].length, this.map.length];
    },
  };

  discrete.create(3, 3, 3);

  // translation origin offset
  const model_tscale = 1.0;

  // camera to center with z-offset
  const discrete_sizes = discrete.sizes();
  mat4.translate(mat_projection, mat_projection, discrete_sizes.map(e => -(e * model_tscale) / 2));


  // origin to center
  model_origin[0] = +(discrete_sizes[0] * model_tscale) / 2;
  model_origin[1] = +(discrete_sizes[1] * model_tscale) / 2;
  model_origin[2] = +(discrete_sizes[2] * model_tscale) / 2;

  */

  mat4.translate(mat_projection, mat_projection, [0, 0, -15]);

  // marching cubes
  const f = (x, y, z) => {
    return 2.5 - Math.sqrt(x*x + y*y + z*z);
  }

  const MC = MarchingCubes();

  mesh = {
    coords: [],
  };

  for (let x = -3; x <= +3; ++x) {
    for (let y = -3; y <= +3; ++y) {
      for (let z = -3; z <= +3; ++z) {
        const v = MC.march(f, x, y, z, true);
        mesh.coords = [...mesh.coords, ...v];
      }
    }
  }

  const vbo = {
    coord: [], // 3
    color: [], // 4
    normal: [], // 3
    indices: [], // 1
    texcoord: [], // 2
  };

  function make_normals(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
    // source: https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal
    //       p2
    //  _   ^  \
    //  U  /    \
    //    /      \
    //   /        \
    //  p1------->p3
    //       _
    //       V
    const Ux = x2 - x1;
    const Uy = y2 - y1;
    const Uz = z2 - z1;
    const Vx = x3 - x1;
    const Vy = y3 - y1;
    const Vz = z3 - z1;
    const Nx = Uy * Vz - Uz * Vy;
    const Ny = Uz * Vx - Ux * Vz;
    const Nz = Ux * Vy - Uy * Vx;
    return [Nx, Ny, Nz];
  }

  const vertices_num = mesh.coords.length / 3;

  vbo.coord = mesh.coords;
  vbo.indices = [...Array(vertices_num)].map((_, i) => i);

  for (let i = 0; i < vertices_num; ++i) {
    vbo.color = [...vbo.color, 1, 1, 1, 1];
    //vbo.color = vbo.color.concat([...[1, 1, 1].map(e => Math.random()), 1]);
    //vbo.normal = vbo.normal.concat([0, 0, 0]);
    vbo.texcoord = vbo.texcoord.concat([0, 0]);
  }

  const faces_num = vertices_num / 3;

  for (let i = 0; i < faces_num; ++i) {
    const start_i = i * 3 * 3;
    const normals = make_normals(...mesh.coords.slice(start_i, start_i + 9));
    vbo.normal.push(normals[0]); // x1
    vbo.normal.push(normals[1]); // y1
    vbo.normal.push(normals[2]); // z1
    vbo.normal.push(normals[0]); // x2
    vbo.normal.push(normals[1]); // y2
    vbo.normal.push(normals[2]); // z2
    vbo.normal.push(normals[0]); // x3
    vbo.normal.push(normals[1]); // y3
    vbo.normal.push(normals[2]); // z3
  }


  console.log(vbo);

  webgl.bind_vbo(vbo);


  // start rendering
  let old_timestamp = 0;
  (function render(timestamp = 0) {
    const elapsed = timestamp - old_timestamp;
    old_timestamp = timestamp;

    // clearing scene
    webgl.clear();

    // push modelview
    matstack.push(mat_modelview);

    // modelview matrix

    // rotation
    mat4.translate(mat_modelview, mat_modelview, [+model_origin[0], +model_origin[1], +model_origin[2]]);
    mat4.rotateX(mat_modelview, mat_modelview, +model_rotation[0]);
    mat4.rotateY(mat_modelview, mat_modelview, +model_rotation[1]);
    mat4.rotateZ(mat_modelview, mat_modelview, +model_rotation[2]);
    mat4.translate(mat_modelview, mat_modelview, [-model_origin[0], -model_origin[1], -model_origin[2]]);

    // translation
    //mat4.translate(mat_modelview, mat_modelview, [x * model_tscale, y * model_tscale, z * model_tscale]);

    // drawing
    //webgl.draw(mat_projection, mat_modelview, 3 * 87, 0);
    webgl.draw(mat_projection, mat_modelview, vbo.indices.length);

    // pop modelview
    matstack.pop(mat_modelview);



    /*
    discrete.for_each((e, x, y, z, m) => {
      if (!e) return;

      // push modelview
      matstack.push(mat_modelview);

      // modelview matrix

      // rotation
      mat4.translate(mat_modelview, mat_modelview, [+model_origin[0], +model_origin[1], +model_origin[2]]);
      mat4.rotateX(mat_modelview, mat_modelview, +model_rotation[0]);
      mat4.rotateY(mat_modelview, mat_modelview, +model_rotation[1]);
      mat4.rotateZ(mat_modelview, mat_modelview, +model_rotation[2]);
      mat4.translate(mat_modelview, mat_modelview, [-model_origin[0], -model_origin[1], -model_origin[2]]);

      // translation
      mat4.translate(mat_modelview, mat_modelview, [x * model_tscale, y * model_tscale, z * model_tscale]);

      // drawing
      webgl.draw(mat_projection, mat_modelview);

      // pop modelview
      matstack.pop(mat_modelview);
    });
    */

    // requesting next frame
    requestAnimationFrame(render);
  })();
}
