//
if (!vec3) var vec3 = glMatrix.vec3;
if (!mat4) var mat4 = glMatrix.mat4;

function WebGL({ screen_width, screen_height, parent, class_name }) {
  screen_width  = screen_width  || 300;
  screen_height = screen_height || 300;
  parent        = parent        || document.body;
  class_name    = class_name    || 'webgl';

  // creating webgl context

  const gl = document.createElement('canvas').getContext('webgl', { preserveDrawingBuffer: true });
  gl.canvas.width = screen_width;
  gl.canvas.height = screen_height;
  gl.canvas.classList.add(class_name);
  parent.appendChild(gl.canvas);

  // preparing scene

  gl.viewport(0,0, gl.canvas.width, gl.canvas.height);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.clearDepth(1.0);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // enabling alpha-blending (you must sort transparent models by yourself)

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


  function compile_shader(type, data) {
    if (type !== gl.VERTEX_SHADER
    &&  type !== gl.FRAGMENT_SHADER)
    {
      throw Error(`compile_shader:: '${type}' is not type of shader`);
    }
    const shader = gl.createShader(type);
    gl.shaderSource(shader, data);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw Error(`'compile_shader:: ${type}:: ${gl.getShaderInfoLog(shader)}`);
    }
    return shader;
  }


  function create_shader_program(...shaders) {
    const program = gl.createProgram();
    for (let shader of shaders) {
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    gl.useProgram(program);
    return program;
  }


  function define_uniform_locations(shader_program, dict) {
    for (let key in dict) {
      if (typeof dict[key] === 'string') {
        dict[key] = gl.getUniformLocation(shader_program, dict[key]);
      } else if (typeof dict[key] === 'object') {
        define_uniform_locations(shader_program, dict[key]);
      }
    }
  }


  function define_attrib_locations(shader_program, dict) {
    for (let key in dict) {
      if (typeof dict[key] === 'string') {
        dict[key] = gl.getAttribLocation(shader_program, dict[key]);
        gl.enableVertexAttribArray(dict[key]);
      }
    }
  }


  function set_ambient_light(u_location, color) {
    gl.uniform3f(u_location, ...color);
  }


  function set_directional_light(u_location, color, direction) {
    if (!('color' in u_location)
    ||  !('direction' in u_location))
    {
      throw Error('set_directional_light:: u_location has no attribute color and/or direction');
    }
    const normalized = vec3.create();
    vec3.normalize(normalized, direction);
    gl.uniform3f(u_location.color, ...color);
    gl.uniform3f(u_location.direction, ...normalized);
  }


  function create_texture(image) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
    // https://www.khronos.org/registry/OpenGL-Refpages/gl2.1/xhtml/glTexParameter.xml
  }


  function bind_array_buffer(a_location, typed_array, size, type, buffer = null) {
    buffer = buffer || gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, typed_array, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_location, size, type, false, 0, 0);
    return buffer;
  }


  function bind_element_buffer(typed_array, buffer = null) {
    buffer = buffer || gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, typed_array, gl.STATIC_DRAW);
    return buffer;
  }


  return {
    // context itself
    gl,
    // object with context and methods
    webgl: {
      gl,
      compile_shader,
      create_shader_program,
      define_uniform_locations,
      define_attrib_locations,
      set_ambient_light,
      set_directional_light,
      create_texture,
      bind_array_buffer,
      bind_element_buffer,
    },
  }
}


// creates matrices stack
WebGL.create_stack_mat4 = function() {
  return {
    stack: [],
    pop(m) { mat4.copy(m, this.stack.pop()); },
    push(m) { this.stack.push(mat4.clone(m)); },
  };
}


// projects 3d coordinates into 2d screen
WebGL.project_vec3 = function(pos3, projection, modelview, screen_width, screen_height) {
  const posT = vec3.create();
  vec3.transformMat4(posT, pos3, modelview);
  vec3.transformMat4(posT, posT, projection);
  posT[0] /= +posT[2];
  posT[1] /= -posT[2];
  return [
    (posT[0] + 1) * (screen_width >> 1),
    (posT[1] + 1) * (screen_height >> 1),
  ];
}


// creates face normal
WebGL.create_face_normal = function(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
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


// defines cube
WebGL.create_cube = function() {
  /*
   * (1) 0,1--->1,1 (2)
   *      ^[1]/ ^|
   *      |  / / |
   *      | / /  |
   *      |v /[2]v
   * (0) 0,0<---1,0 (3)
   */
  return {
    // coordinates
    coordinates: [
      0, 0, 0,   0, 1, 0,   1, 1, 0,   1, 0, 0, // front
      0, 0, 1,   0, 1, 1,   1, 1, 1,   1, 0, 1, // back
      0, 0, 0,   0, 0, 1,   1, 0, 1,   1, 0, 0, // bottom
      0, 1, 0,   0, 1, 1,   1, 1, 1,   1, 1, 0, // top
      0, 0, 0,   0, 1, 0,   0, 1, 1,   0, 0, 1, // left
      1, 0, 0,   1, 1, 0,   1, 1, 1,   1, 0, 1, // right
    ],
    // normals
    normals: [
      0,  0, -1,    0,  0, -1,    0,  0, -1,    0,  0, -1, // front
      0,  0, +1,    0,  0, +1,    0,  0, +1,    0,  0, +1, // back
      0, -1,  0,    0, -1,  0,    0, -1,  0,    0, -1,  0, // bottom
      0, +1,  0,    0, +1,  0,    0, +1,  0,    0, +1,  0, // top
     -1,  0,  0,   -1,  0,  0,   -1,  0,  0,   -1,  0,  0, // left
     +1,  0,  0,   +1,  0,  0,   +1,  0,  0,   +1,  0,  0, // right
    ],
    // indices
    indices: [
       0,  1,  2,  2,  3,  0, // front
       4,  5,  6,  6,  7,  4, // back
       8,  9, 10, 10, 11,  8, // bottom
      12, 13, 14, 14, 15, 12, // top
      16, 17, 18, 18, 19, 16, // left
      20, 21, 22, 22, 23, 20, // right
    ],
    // vertices colors
    colors: [
      1.0, 0.0, 0.0, 1.0,  1.0, 0.0, 0.0, 1.0,  1.0, 0.0, 0.0, 1.0,  1.0, 0.0, 0.0, 1.0, // front (red)
      0.0, 1.0, 0.0, 1.0,  0.0, 1.0, 0.0, 1.0,  0.0, 1.0, 0.0, 1.0,  0.0, 1.0, 0.0, 1.0, // back (green)
      1.0, 0.0, 1.0, 1.0,  1.0, 0.0, 1.0, 1.0,  1.0, 0.0, 1.0, 1.0,  1.0, 0.0, 1.0, 1.0, // botton (magenta)
      0.0, 1.0, 1.0, 1.0,  0.0, 1.0, 1.0, 1.0,  0.0, 1.0, 1.0, 1.0,  0.0, 1.0, 1.0, 1.0, // top (cyan)
      0.0, 0.0, 1.0, 1.0,  0.0, 0.0, 1.0, 1.0,  0.0, 0.0, 1.0, 1.0,  0.0, 0.0, 1.0, 1.0, // left (blue)
      1.0, 1.0, 0.0, 1.0,  1.0, 1.0, 0.0, 1.0,  1.0, 1.0, 0.0, 1.0,  1.0, 1.0, 0.0, 1.0, // right (yellow)
    ],
    // texture coordinates
    texcoords: [
      0, 0,   0, 1,   1, 1,   1, 0, // front
      0, 0,   0, 1,   1, 1,   1, 0, // back
      0, 0,   0, 1,   1, 1,   1, 0, // bottom
      0, 0,   0, 1,   1, 1,   1, 0, // top
      0, 0,   0, 1,   1, 1,   1, 0, // left
      0, 0,   0, 1,   1, 1,   1, 0, // right
    ],
  };
}


// starts demo
WebGL.render_demo = function(parent) {
  parent = parent || document.body;

  const screen_width = 400;
  const screen_height = 250;

  const { gl, webgl } = WebGL({ screen_width, screen_height, parent });

  // --------------- shaders --------------------

  const raw_vertex_shader =
  `
    precision mediump float;

    struct DirectionalLight {
      vec3 direction;
      vec3 color;
    };

    attribute vec3 a_coord;
    attribute vec4 a_color;
    attribute vec3 a_normal;

    uniform mat4 u_view;
    uniform mat4 u_normal;
    uniform vec3 u_ambient_light;
    uniform DirectionalLight u_directional_light;

    varying vec4 v_color;
    varying vec3 v_light;

    void main(void) {
      v_color = a_color;

      // making light
      vec4 transformed_normal = u_normal * vec4(a_normal, 1.0);
      float directional_light = max(dot(transformed_normal.xyz, u_directional_light.direction), 0.0);
      v_light = u_ambient_light + (u_directional_light.color * directional_light);

      gl_Position = u_view * vec4(a_coord, 1.0);
      gl_PointSize = 3.0;
    }
  `;

  const raw_fragment_shader =
  `
    precision mediump float;

    varying vec4 v_color;
    varying vec3 v_light;

    void main(void) {
      gl_FragColor = vec4(v_color.rgb * v_light, v_color.a);
    }
  `;

  const vertex_shader = webgl.compile_shader(gl.VERTEX_SHADER, raw_vertex_shader);
  const fragment_shader = webgl.compile_shader(gl.FRAGMENT_SHADER, raw_fragment_shader);
  const shader_program = webgl.create_shader_program(vertex_shader, fragment_shader);

  const u_loc = {
    view: 'u_view',
    normal: 'u_normal',
    ambient_light: 'u_ambient_light',
    directional_light: {
      color: 'u_directional_light.color',
      direction: 'u_directional_light.direction',
    },
  };

  const a_loc = {
    coord: 'a_coord',
    color: 'a_color',
    normal: 'a_normal',

  };

  webgl.define_uniform_locations(shader_program, u_loc);
  webgl.define_attrib_locations(shader_program, a_loc);

  // ------------- VBO --------------

  const cube = WebGL.create_cube();

  webgl.bind_array_buffer(a_loc.coord,  new Float32Array(cube.coordinates), 3, gl.FLOAT);
  webgl.bind_array_buffer(a_loc.color,  new Float32Array(cube.colors),      4, gl.FLOAT);
  webgl.bind_array_buffer(a_loc.normal, new Float32Array(cube.normals),     3, gl.FLOAT);
  webgl.bind_element_buffer(new Uint16Array(cube.indices));

  // ------------ lights -------------

  webgl.set_ambient_light(u_loc.ambient_light, [0.5, 0.5, 0.5]);
  webgl.set_directional_light(u_loc.directional_light, [0.5, 0.5, 0.5], [0.85, 0.80, 0.75]);

  // ------------ matrices -------------

  const mat_projection = mat4.create();
  mat4.perspective(mat_projection, Math.PI / 4, screen_width / screen_height, 0.1, 100.0);
  mat4.translate(mat_projection, mat_projection, [-0.5, -0.5, -5]);

  const mat_modelview = mat4.create();

  // ------------ draw ---------------

  setInterval(render, 100);

  function render() {
    // rotate modelview matrix
    mat4.translate(mat_modelview, mat_modelview, [+0.5, +0.5, +0.5]);
    mat4.rotateX(mat_modelview, mat_modelview, +0.10);
    mat4.rotateY(mat_modelview, mat_modelview, -0.10);
    mat4.rotateZ(mat_modelview, mat_modelview, +0.15);
    mat4.translate(mat_modelview, mat_modelview, [-0.5, -0.5, -0.5]);

    // matrices multiplication done on client side
    const view = mat4.create();
    mat4.multiply(view, mat_projection, mat_modelview);

    // for lighting
    const normal = mat4.create();
    mat4.invert(normal, mat_modelview);
    mat4.transpose(normal, normal);

    // sending
    gl.uniformMatrix4fv(u_loc.view, false, view);
    gl.uniformMatrix4fv(u_loc.normal, false, normal);

    // render
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);
  }
}
