//
function Graphics(screen_width, screen_height, parent) {
  parent = parent || document.body;

  if (!WebGL) throw Error('Graphics:: WebGL not found');
  if (!Canvas) throw Error('Graphics:: Canvas not found');

  const { gl, webgl } = WebGL(screen_width, screen_height, parent);
  const ctx = Canvas(screen_width, screen_height, parent);

  const shader_program = webgl.create_shader_program(
    webgl.compile_shader(gl.VERTEX_SHADER, DATA__vertex_shader),
    webgl.compile_shader(gl.FRAGMENT_SHADER, DATA__fragment_shader),
  );

  const u_loc = webgl.define_uniform_locations(shader_program, {
    view: 'u_view',
    normal: 'u_normal',
    ambient_light: 'u_ambient_light',
    directional_light: {
      color: 'u_directional_light.color',
      direction: 'u_directional_light.direction',
    },
  });

  const a_loc = webgl.define_attrib_locations(shader_program, {
    coord: 'a_coord',
    color: 'a_color',
    normal: 'a_normal',
  });

  webgl.set_ambient_light(u_loc.ambient_light, [0.0, 0.0, 0.0]);
  webgl.set_directional_light(u_loc.directional_light, [1.0, 1.0, 1.0], [0, 0, 1]); // sin wave a? a? a?

  const triangle = Graphics.create_triangle();
  console.log(triangle);

  const color_array_buffer = webgl.bind_array_buffer(a_loc.color, new Float32Array(triangle.colors), 4, gl.FLOAT);

  webgl.bind_array_buffer(a_loc.coord,  new Float32Array(triangle.coordinates), 3, gl.FLOAT);
  webgl.bind_array_buffer(a_loc.normal, new Float32Array(triangle.normals),     3, gl.FLOAT);
  webgl.bind_element_buffer(new Uint16Array(triangle.indices));


  const mat_projection = mat4.create();
  const FOV    = Math.PI / 4;
  const RATIO  = screen_width / screen_height;
  const Z_NEAR = 0.1;
  const Z_FAR  = 100.0;
  mat4.perspective(mat_projection, FOV, RATIO, Z_NEAR, Z_FAR);

  const mat_modelview = mat4.create();

  const Stack = WebGL.create_stack_mat4();

  // -------------------------------------

  const camera_zoom = 5;

  const camera_height = 0;

  const camera_position = [-triangle.center_actual[0], -camera_height, -camera_zoom];

  const scene_rotation = [22.5 * Math.PI / 180, +0.0, +0.0];

  const scene_origin = triangle.center_actual;

  const scene_next_origin = triangle.center_reversed;

  const scene_next_origin_vector = triangle.center_actual.map((e, i) => triangle.center_reversed[i] - e);

  let scene_next_origin_vector_scaler = 0.0;

  const scene_rotation_speed = 0.005;


  const map_width = 10;
  const map_height = 10;
  // const map = [...Array(map_width * map_height)].map(e => Math.random() < 0.5 ? 0 : Math.random() * 10 | 0);
  const map = [...Array(map_width * map_height)].map(e => 1 + Math.random() * 9 | 0);


  const player_x = 0;
  const player_y = 0;
  const player_view_dist_x = 1;
  const player_view_dist_y = 1;

  function map_get(x, y) {
    if (x < 0) x += map_width; else if (x > map_width - 1) x -= map_width;
    if (y < 0) y += map_height; else if (y > map_height - 1) y -= map_height;
    return map[x + y * map_width];
  }


  let dlight_sina = 0;


  // ------------ map configuration -------

  // Logic map example:
  // .------------------->X
  // |
  // |  [0][1][2][3][4][5]
  // |  [6][7][8][9][A][B]
  // v
  // Z
  //
  // Visual map example:
  // .--------------------------->X
  // |        ,_____,_____,_____,
  // |       /0\ 1 /2\ 3 /4\ 5 /
  // |     ,/___\,/___\,/___\,/
  // |    /6\ 7 /8\ 9 /A\ B /
  // v   /___\,/___\,/___\,/
  // Z
  //
  // Moving rules:
  //
  // INDEX(X, Y) = X + Y * ROW_LENGTH;
  //
  // If player stands on odd index, he can move
  // UP: X - 1, Y - 1, neither DOWN: X + 1, Y + 1.
  // Also player always can move LEFT: X - 1 or RIGHT: X + 1.

  // ------------ mouse ------------------

  const Mouse = {
    event: null,
    onmouseup(e) { this.event = null; },
    onmousedown(e) { this.event = e; },
    onmousemove(e) {
      if (this.event) {
        const dx = e.clientX - this.event.clientX;
        const dy = e.clientY - this.event.clientY;
        //scene_rotation[0] += +dy * scene_rotation_speed;
        scene_rotation[1] += +dx * scene_rotation_speed;
        //scene_rotation[2] += 0;
        this.event = e;
      }
    },
  };

  window.addEventListener('mouseup', e => Mouse.onmouseup(e), false);
  window.addEventListener('mousedown', e => Mouse.onmousedown(e), false);
  window.addEventListener('mousemove', e => Mouse.onmousemove(e), false);

  // ------------ render -----------------

  let old_timestamp = 0;

  function render(timestamp = 0) {
    const elapsed = timestamp - old_timestamp;
    old_timestamp = timestamp;

    ctx.clearRect(0, 0, screen_width, screen_height);

    // fps
    const FPS = 1000 / elapsed | 0;
    ctx.font = '24px "Arial"';
    ctx.fillStyle = 'white';
    ctx.fillText(FPS, 30, 30);

    // player
    const RADIUS = 60 / camera_zoom;
    const POSX = screen_width / 2;
    const POSY = screen_height / 2;
    ctx.fillStyle = 'cyan';
    ctx.beginPath();
    ctx.arc(POSX, POSY, RADIUS, 0, 2 * Math.PI);
    ctx.fill();


    // webgl.set_directional_light(u_loc.directional_light, [1.0, 1.0, 1.0], [0, -Math.sin(dlight_sina), Math.sin(dlight_sina)]);
    // dlight_sina += elapsed * 0.001;
    // ctx.fillText(dlight_sina, 10, 100);
    // ctx.fillText(Math.sin(dlight_sina), 10, 120);


    // push matrices
    Stack.push(mat_projection);


    mat4.translate(mat_projection, mat_projection, camera_position);


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // for (let y = -player_view_dist_y / 2 | 0; y < +player_view_dist_y / 2 | 0; ++y)
    //   for (let x = -player_view_dist_x; x < +player_view_dist_x; ++x)
    for (let y = 0; y < 1; ++y)
      for (let x = 0; x < 1; ++x)
    {
      const map_value = map_get(x, y);
      if (map_value) {

        const figure_color = DATA__randomcolors[map_value];
        webgl.bind_array_buffer(a_loc.color, new Float32Array(Array(triangle.indices.length).fill(figure_color).flat()), 4, gl.FLOAT, color_array_buffer);

        Stack.push(mat_modelview);


        mat4.translate(mat_modelview, mat_modelview, [+scene_origin[0], +scene_origin[1], +scene_origin[2]]);
        mat4.rotateX(mat_modelview, mat_modelview, scene_rotation[0]);
        mat4.rotateY(mat_modelview, mat_modelview, scene_rotation[1]);
        mat4.rotateZ(mat_modelview, mat_modelview, scene_rotation[2]);
        mat4.translate(mat_modelview, mat_modelview, [-scene_origin[0], -scene_origin[1], -scene_origin[2]]);


        mat4.translate(mat_modelview, mat_modelview, [(x + y) * triangle.a / 2, 0, y * triangle.h]);


        if (x % 2) {
          mat4.translate(mat_modelview, mat_modelview, [triangle.a, 0, triangle.h]);
          mat4.rotateY(mat_modelview, mat_modelview, Math.PI);
        }


        const view = mat4.create();
        mat4.multiply(view, mat_projection, mat_modelview);

        const normal = mat4.create();
        mat4.invert(normal, mat_modelview);
        mat4.transpose(normal, normal);

        gl.uniformMatrix4fv(u_loc.view, false, view);
        gl.uniformMatrix4fv(u_loc.normal, false, normal);

        gl.drawElements(gl.TRIANGLES, triangle.indices.length, gl.UNSIGNED_SHORT, 0);



        for (let i = 0; i < triangle.indices.length; ++i) {
          const index = triangle.indices[i];

          const coord = [
            triangle.coordinates[0 + 3 * index],
            triangle.coordinates[1 + 3 * index],
            triangle.coordinates[2 + 3 * index],
          ];

          const nscale = 1;

          const normal = [
            coord[0] + triangle.normals[0 + 3 * index] * nscale,
            coord[1] + triangle.normals[1 + 3 * index] * nscale,
            coord[2] + triangle.normals[2 + 3 * index] * nscale,
          ];

          const posT = vec3.create();
          vec3.transformMat4(posT, coord, view);
          const from = [
            (posT[0] / +posT[2] + 1) * (screen_width >> 1),
            (posT[1] / -posT[2] + 1) * (screen_height >> 1),
          ];

          vec3.transformMat4(posT, normal, view);
          const to = [
            (posT[0] / +posT[2] + 1) * (screen_width >> 1),
            (posT[1] / -posT[2] + 1) * (screen_height >> 1),
          ];

          ctx.strokeStyle = 'yellow';
          ctx.beginPath();
          ctx.moveTo(...from);
          ctx.lineTo(...to);
          ctx.stroke();

          ctx.fillStyle = 'white';
          ctx.fillText(i, ...to);
        }



        Stack.pop(mat_modelview);

      }
    }




    // translate camera to the center


    // rotate scene


    // changing origin slightly
    // scene_next_origin_vector_scaler += 0.001 * elapsed;
    // if (scene_next_origin_vector_scaler >= 1) scene_next_origin_vector_scaler = 0;
    // const scene_current_origin = scene_origin.map((e, i) => scene_next_origin_vector[i] * -scene_next_origin_vector_scaler);
    // mat4.translate(mat_projection, mat_projection, scene_current_origin);

    // matrices multiplication done on client side


    // pop matrices

    Stack.pop(mat_projection);

    requestAnimationFrame(render);
  }


  return {
    render,
  }
}


Graphics.create_triangle = function() {
  const a = 1.0;
  const h = a * (3 ** 0.5) / 2;
  const r = a * (3 ** 0.5) / 6;
  const z = -1.0;

  const center_reversed = [0, z, h - r];  // reversed triangle by left
  const center_actual = [a / 2, z, r]; // actual triangle by right
  const center_block = [a / 4, z, a * (3 ** 0.5) / 4]; // parallelogram center

  const coordinates_set = [
    0, 0, 0,   a, 0, 0,   a / 2, 0, h, // triangle
    0, z, 0,   a, z, 0,   a / 2, z, h, // corners
  ];

  const indices = [
    0, 2, 1,          // triangle
    3, 0, 1, 1, 4, 3, // front corner
    4, 1, 2, 2, 5, 4, // right corner
    5, 2, 0, 0, 3, 5, // left corner
  ];

  const coordinates = [];

  for (let i = 0; i < indices.length; ++i) {
    coordinates.push(
      coordinates_set[0 + 3 * indices[i]],
      coordinates_set[1 + 3 * indices[i]],
      coordinates_set[2 + 3 * indices[i]],
    );
  }


  const normals = [

  ];

    //     // 0, +1,  0,    0, +1,  0,    0, +1,  0,

    // ...[...Array(indices.length / 3)].map((_, i) =>  Array(3).fill(WebGL.create_face_normal(
    //   coordinates[0 + 3 * indices[0 + 3 * i]],
    //   coordinates[1 + 3 * indices[0 + 3 * i]],
    //   coordinates[2 + 3 * indices[0 + 3 * i]],

    //   coordinates[0 + 3 * indices[1 + 3 * i]],
    //   coordinates[1 + 3 * indices[1 + 3 * i]],
    //   coordinates[2 + 3 * indices[1 + 3 * i]],

    //   coordinates[0 + 3 * indices[2 + 3 * i]],
    //   coordinates[1 + 3 * indices[2 + 3 * i]],
    //   coordinates[2 + 3 * indices[2 + 3 * i]],
    // )).flat()).flat(),




  for (let i = 0; i < indices.length / 3; ++i) {

    const face = [

      coordinates_set[0 + 3 * indices[0 + 3 * i]],
      coordinates_set[1 + 3 * indices[0 + 3 * i]],
      coordinates_set[2 + 3 * indices[0 + 3 * i]],

      coordinates_set[0 + 3 * indices[1 + 3 * i]],
      coordinates_set[1 + 3 * indices[1 + 3 * i]],
      coordinates_set[2 + 3 * indices[1 + 3 * i]],

      coordinates_set[0 + 3 * indices[2 + 3 * i]],
      coordinates_set[1 + 3 * indices[2 + 3 * i]],
      coordinates_set[2 + 3 * indices[2 + 3 * i]],

    ];

    const normal = WebGL.create_face_normal(...face);


    normals.push(...normal, ...normal, ...normal);



  }




  // prints normals
  console.log(Array(normals.length / 3).fill().map((_, i) => [normals[0 + 3 * i], normals[1 + 3 * i], normals[2 + 3 * i]]));




  return {
    coordinates,
    indices: Array(indices.length).fill().map((_, i) => i),

    normals,

    colors: [...Array(indices.length / 3)].map(_ => [1.0, 0.0, 0.0, 1.0,   0.0, 1.0, 0.0, 1.0,    0.0, 0.0, 1.0, 1.0,]).flat(),

    center_reversed,
    center_actual,
    center_block,

    a, h, r, z,

  };
}