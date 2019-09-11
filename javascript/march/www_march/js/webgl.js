/*
 * Simple WebGL.
 * Call 'WebGL.demo()' to start demo.
 */
function WebGL(screen_width, screen_height, parent) {
  // glMatrix requires

  const { vec3, mat4 } = glMatrix;

  // creating webgl context

  const gl = document.createElement('canvas').getContext('webgl', { preserveDrawingBuffer: true });
  gl.canvas.width = screen_width;
  gl.canvas.height = screen_height;
  (parent || document.body).appendChild(gl.canvas);

  // defining shaders

  const VERTEX_SHADER =
  `
    precision mediump float;

    struct DirectionalLight {
      vec3 direction;
      vec3 color;
    };

    attribute vec3 a_coord;
    attribute vec4 a_color;
    attribute vec3 a_normal;
    attribute vec2 a_texcoord;

    uniform mat4 u_view;
    uniform mat4 u_normal; // generating every frame (depending on modelview)
    uniform vec3 u_ambient_light;
    uniform DirectionalLight u_directional_light;

    varying vec4 v_color;
    varying vec3 v_light;
    varying vec2 v_texcoord;

    void main(void) {
      v_color = a_color;
      v_texcoord = a_texcoord;

      // -- making light --
      vec4 transformed_normal = u_normal * vec4(a_normal, 1.0);
      float directional_light = max(dot(transformed_normal.xyz, u_directional_light.direction), 0.0);
      v_light = u_ambient_light + (u_directional_light.color * directional_light);

      gl_Position = u_view * vec4(a_coord, 1.0);
      gl_PointSize = 3.0;
    }
  `;

  const FRAGMENT_SHADER =
  `
    precision mediump float;

    uniform sampler2D u_texture;

    varying vec4 v_color;
    varying vec3 v_light;
    varying vec2 v_texcoord;

    void main(void) {
      // w/o light
      //gl_FragColor = v_color;

      // w/o color
      //gl_FragColor = vec4(vec3(1.0, 1.0, 1.0) * v_light, 1.0);

      // w/o texture
      gl_FragColor = vec4(v_color.rgb * v_light, v_color.a);

      // with texture, w/o color
      // vec4 texel_color = texture2D(u_texture, v_texcoord);
      //gl_FragColor = vec4(texel_color.rgb * v_light, texel_color.a);
    }
  `;

  // compiling shaders

  const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertex_shader, VERTEX_SHADER);
  gl.compileShader(vertex_shader);
  if (!gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS))
    console.log('VERTEX_SHADER ::', gl.getShaderInfoLog(vertex_shader));

  const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragment_shader, FRAGMENT_SHADER);
  gl.compileShader(fragment_shader);
  if (!gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS))
    console.log('FRAGMENT_SHADER ::', gl.getShaderInfoLog(fragment_shader));

  // creating shader program

  const shader_program = gl.createProgram();
  gl.attachShader(shader_program, vertex_shader);
  gl.attachShader(shader_program, fragment_shader);
  gl.linkProgram(shader_program);
  gl.useProgram(shader_program);

  // defining uniform arrays

  const u_view = gl.getUniformLocation(shader_program, 'u_view');
  const u_normal = gl.getUniformLocation(shader_program, 'u_normal');
  const u_texture = gl.getUniformLocation(shader_program, 'u_texture');
  const u_ambient_light = gl.getUniformLocation(shader_program, 'u_ambient_light');
  const u_directional_light = {
    color: gl.getUniformLocation(shader_program, 'u_directional_light.color'),
    direction: gl.getUniformLocation(shader_program, 'u_directional_light.direction'),
  };

  // defining attribute arrays

  const a_coord = gl.getAttribLocation(shader_program, 'a_coord');
  const a_color = gl.getAttribLocation(shader_program, 'a_color');
  const a_normal = gl.getAttribLocation(shader_program, 'a_normal');
  const a_texcoord = gl.getAttribLocation(shader_program, 'a_texcoord');

  // enabling attribute arrays

  gl.enableVertexAttribArray(a_coord);
  gl.enableVertexAttribArray(a_color);
  gl.enableVertexAttribArray(a_normal);
  gl.enableVertexAttribArray(a_texcoord);

  // preparing scene

  gl.viewport(0,0, gl.canvas.width, gl.canvas.height);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.clearDepth(1.0);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // enabling alpha-blending
  // (you need to manualy sort all models that have transparent textures)

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // set lights
  set_ambient_light([0.5, 0.5, 0.5]);
  set_directional_light([0.5, 0.5, 0.5], [0.85, 0.80, 0.75]);

  // -- methods --

  function make_texture(image) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
    //
    // -- gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //
    // -- Prevents s-coordinate wrapping (repeating).
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //
    // -- Prevents t-coordinate wrapping (repeating).
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    //
    // Also see:
    // https://open.gl/textures
  }

  function bind_array_buffer(array, attrib, size) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
    gl.vertexAttribPointer(attrib, size, gl.FLOAT, false, 0, 0);
    return buffer;
  }

  function bind_element_buffer(array) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(array), gl.STATIC_DRAW);
    return buffer;
  }

  function bind_vbo(vbo) {
    bind_array_buffer(vbo.coord,    a_coord,    3);
    bind_array_buffer(vbo.color,    a_color,    4);
    bind_array_buffer(vbo.normal,   a_normal,   3);
    bind_array_buffer(vbo.texcoord, a_texcoord, 2);
    return bind_element_buffer(vbo.indices);
  }

  function draw(projection, modelview, indices_number = 36, indices_offset = 0, type = gl.TRIANGLES) {
    const view = mat4.create();
    mat4.multiply(view, projection, modelview);

    const normal = mat4.create();
    mat4.invert(normal, modelview);
    mat4.transpose(normal, normal);

    gl.uniformMatrix4fv(u_view, false, view);
    gl.uniformMatrix4fv(u_normal, false, normal);

    // gl.activeTexture(gl.TEXTURE0);
    // gl.bindTexture(gl.TEXTURE_2D, texture);
    // gl.uniform1i(u_texture, 0);

    gl.drawElements(type, indices_number, gl.UNSIGNED_SHORT, indices_offset);
  }

  function clear() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  function set_ambient_light(color) {
    gl.uniform3f(u_ambient_light, ...color);
  }

  function set_directional_light(color, direction) {
    const normalized = vec3.create();
    vec3.normalize(normalized, direction);
    gl.uniform3f(u_directional_light.color, ...color);
    gl.uniform3f(u_directional_light.direction, ...normalized);
  }

  // TODO: может быть сделать специальный класс для функций, не
  //       общающихся напрямую с контекстом опенгл?

  // projects 3d coordinates to 2d
  function to_pos2(pos3, projection, modelview, width, height) {
    const posT = vec3.create();
    vec3.transformMat4(posT, pos3, modelview);
    vec3.transformMat4(posT, posT, projection);
    posT[0] /= +posT[2];
    posT[1] /= -posT[2];
    return [
      (posT[0] + 1) * (width >> 1),
      (posT[1] + 1) * (height >> 1),
    ];
  }

  return {
    gl,
    draw,
    clear,
    bind_vbo,
    bind_array_buffer,
    bind_element_buffer,
    make_texture,
    set_ambient_light,
    set_directional_light,
    to_pos2,
  }
}


// creates face normal
WebGL.create_face_normal = (x1, y1, z1, x2, y2, z2, x3, y3, z3) => {
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
  const Nmag = Math.sqrt(Nx * Nx + Ny * Ny + Nz * Nz);
  return [Nx / Nmag, Ny / Nmag, Nz / Nmag];
}


WebGL.vbo_cube = () => {
  /*
   * (1) 0,1--->1,1 (2)
   *      ^[1]/ ^|
   *      |  / / |
   *      | / /  |
   *      |v /[2]v
   * (0) 0,0<---1,0 (3)
   */

  // coordinates
  const coord = [
    0, 0, 0,   0, 1, 0,   1, 1, 0,   1, 0, 0, // front
    0, 0, 1,   0, 1, 1,   1, 1, 1,   1, 0, 1, // back
    0, 0, 0,   0, 0, 1,   1, 0, 1,   1, 0, 0, // bottom
    0, 1, 0,   0, 1, 1,   1, 1, 1,   1, 1, 0, // top
    0, 0, 0,   0, 1, 0,   0, 1, 1,   0, 0, 1, // left
    1, 0, 0,   1, 1, 0,   1, 1, 1,   1, 0, 1, // right
  ];

  // normals
  const normal = [
    0,  0, -1,    0,  0, -1,    0,  0, -1,    0,  0, -1, // front
    0,  0, +1,    0,  0, +1,    0,  0, +1,    0,  0, +1, // back
    0, -1,  0,    0, -1,  0,    0, -1,  0,    0, -1,  0, // bottom
    0, +1,  0,    0, +1,  0,    0, +1,  0,    0, +1,  0, // top
   -1,  0,  0,   -1,  0,  0,   -1,  0,  0,   -1,  0,  0, // left
   +1,  0,  0,   +1,  0,  0,   +1,  0,  0,   +1,  0,  0, // right
  ];

  // indices
  const indices = [
     0,  1,  2,  2,  3,  0, // front
     4,  5,  6,  6,  7,  4, // back
     8,  9, 10, 10, 11,  8, // bottom
    12, 13, 14, 14, 15, 12, // top
    16, 17, 18, 18, 19, 16, // left
    20, 21, 22, 22, 23, 20, // right
  ];

  // vertices colors
  const color = [
    1.0, 0.0, 0.0, 1.0,  1.0, 0.0, 0.0, 1.0,  1.0, 0.0, 0.0, 1.0,  1.0, 0.0, 0.0, 1.0, // front (red)
    0.0, 1.0, 0.0, 1.0,  0.0, 1.0, 0.0, 1.0,  0.0, 1.0, 0.0, 1.0,  0.0, 1.0, 0.0, 1.0, // back (green)
    1.0, 0.0, 1.0, 1.0,  1.0, 0.0, 1.0, 1.0,  1.0, 0.0, 1.0, 1.0,  1.0, 0.0, 1.0, 1.0, // botton (magenta)
    0.0, 1.0, 1.0, 1.0,  0.0, 1.0, 1.0, 1.0,  0.0, 1.0, 1.0, 1.0,  0.0, 1.0, 1.0, 1.0, // top (cyan)
    0.0, 0.0, 1.0, 1.0,  0.0, 0.0, 1.0, 1.0,  0.0, 0.0, 1.0, 1.0,  0.0, 0.0, 1.0, 1.0, // left (blue)
    1.0, 1.0, 0.0, 1.0,  1.0, 1.0, 0.0, 1.0,  1.0, 1.0, 0.0, 1.0,  1.0, 1.0, 0.0, 1.0, // right (yellow)
  ];

  // texture coordinates
  const texcoord = [
    0, 0,   0, 1,   1, 1,   1, 0, // front
    0, 0,   0, 1,   1, 1,   1, 0, // back
    0, 0,   0, 1,   1, 1,   1, 0, // bottom
    0, 0,   0, 1,   1, 1,   1, 0, // top
    0, 0,   0, 1,   1, 1,   1, 0, // left
    0, 0,   0, 1,   1, 1,   1, 0, // right
  ];

  return {
    coord,
    color,
    normal,
    indices,
    texcoord,
  }
}

// TODO: do not working, see index.js instead
WebGL.demo = () => {
  const { mat4 } = glMatrix;

  // creating webgl
  const screen_width = 300;
  const screen_height = 300;
  const webgl = WebGL(screen_width, screen_height);
  webgl.bind_vbo(WebGL.vbo_cube());

  // projection matrix
  const mat_projection = mat4.create();
  mat4.perspective(mat_projection, Math.PI / 4, screen_width / screen_height, 0.1, 100.0);
  mat4.translate(mat_projection, mat_projection, [-0.5, -0.5, -5.0]);

  // modelview matrix
  const mat_modelview = mat4.create();
  mat4.translate(mat_modelview, mat_modelview, [+0.5, +0.5, +0.5]);
  mat4.rotateX(mat_modelview, mat_modelview, Math.random() * Math.PI * 2);
  mat4.rotateY(mat_modelview, mat_modelview, Math.random() * Math.PI * 2);
  mat4.rotateZ(mat_modelview, mat_modelview, Math.random() * Math.PI * 2);
  mat4.translate(mat_modelview, mat_modelview, [-0.5, -0.5, -0.5]);

  webgl.set_ambient_light([0.1, 0.0, 0.0]);
  webgl.set_directional_light([1.0, 0.0, 0.0], [0.85, 0.80, 0.75]);

  // start rendering
  let old_timestamp = 0;
  (function render(timestamp = 0) {
    const elapsed = timestamp - old_timestamp;
    old_timestamp = timestamp;

    // cube rotations
    mat4.translate(mat_modelview, mat_modelview, [+0.5, +0.5, +0.5]);
    mat4.rotateX(mat_modelview, mat_modelview, +0.001 * elapsed);
    mat4.rotateY(mat_modelview, mat_modelview, +0.002 * elapsed);
    mat4.rotateZ(mat_modelview, mat_modelview, -0.001 * elapsed);
    mat4.translate(mat_modelview, mat_modelview, [-0.5, -0.5, -0.5]);

    // normal matrix
    const mat_normal = mat4.create();
    mat4.invert(mat_normal, mat_modelview);
    mat4.transpose(mat_normal, mat_normal);

    // drawing
    webgl.clear();
    webgl.draw(mat_projection, mat_modelview, mat_normal);

    // requesting next frame
    requestAnimationFrame(render);
  })();
}
