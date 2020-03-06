
function WebGL(width, height, projection, parent = document.body) {
  const cvs = document.createElement('canvas');
  cvs.height = height;
  cvs.width = width;
  parent.appendChild(cvs);
  const gl = cvs.getContext('webgl', { preserveDrawingBuffer: true });

  // raw shaders

  const vertex_shader_raw = `
attribute vec3 a_position;
attribute vec4 a_vcolor;
attribute vec2 a_texture;

uniform mat4 u_mvmatrix;
uniform mat4 u_pmatrix;

varying vec4 v_vcolor;
varying vec2 v_texture;

void main(void) {
  gl_Position = u_pmatrix * u_mvmatrix * vec4(a_position, 1.0);
  v_vcolor = a_vcolor;
  v_texture = a_texture;
}`;

  const fragment_shader_raw = `
precision highp float;

uniform vec4 u_fcolor;
uniform mat3 u_tmatrix;

varying vec4 v_vcolor;
varying vec2 v_texture;

uniform sampler2D u_sampler;

void main(void) {
  gl_FragColor = texture2D(u_sampler, (u_tmatrix * vec3(v_texture.s, v_texture.t, 1.0)).xy);
  //gl_FragColor = v_vcolor * u_fcolor;
}`;

  // compiles shaders

  const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertex_shader, vertex_shader_raw);
  gl.compileShader(vertex_shader);
  if (!gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS))
    console.log(gl.getShaderInfoLog(vertex_shader));

  const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragment_shader, fragment_shader_raw);
  gl.compileShader(fragment_shader);
  if (!gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS))
    console.log(gl.getShaderInfoLog(fragment_shader));

  // creates and uses shader program

  const shader_program = gl.createProgram();
  gl.attachShader(shader_program, vertex_shader);
  gl.attachShader(shader_program, fragment_shader);
  gl.linkProgram(shader_program);
  gl.useProgram(shader_program);

  const u_mvmatrix = gl.getUniformLocation(shader_program, 'u_mvmatrix');
  const u_pmatrix = gl.getUniformLocation(shader_program, 'u_pmatrix');
  const u_fcolor = gl.getUniformLocation(shader_program, 'u_fcolor');
  const u_texture = gl.getUniformLocation(shader_program, 'u_texture');
  const u_tmatrix = gl.getUniformLocation(shader_program, 'u_tmatrix');

  const a_position = gl.getAttribLocation(shader_program, 'a_position');
  gl.enableVertexAttribArray(a_position);

  const a_vcolor = gl.getAttribLocation(shader_program, 'a_vcolor');
  gl.enableVertexAttribArray(a_vcolor);

  const a_texture = gl.getAttribLocation(shader_program, 'a_texture');
  gl.enableVertexAttribArray(a_texture);

  // prepares and sends to shader the projection matrix
  /*
  const projection = mat.create_gl_identity()
    .gl_projection(Math.PI / 4, cvs.height / cvs.width, 0.1, 1000)
    .float32Array();
  */

  gl.uniformMatrix4fv(u_pmatrix, false, projection);

  // prepares scene

  gl.enable(gl.DEPTH_TEST);
  gl.viewport(0,0, cvs.width, cvs.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // enables alpha-blending (do sort manualy all models that have transparent textures)

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);

  // -- methods --

  function ratio() {
    return cvs.height / cvs.width;
  }

  function clear() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  function set_modelview(m) {
    gl.uniformMatrix4fv(u_mvmatrix, false, m);
  }

  function create_vbo_cube() {
    const positions = new Float32Array([
      1.0,  1.0,  1.0, -1.0,  1.0,  1.0, -1.0, -1.0,  1.0, // front
      1.0,  1.0,  1.0, -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,
     -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0, // back
     -1.0,  1.0, -1.0,  1.0, -1.0, -1.0, -1.0, -1.0, -1.0,
     -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0, -1.0, -1.0, // left
     -1.0,  1.0,  1.0, -1.0, -1.0, -1.0, -1.0, -1.0,  1.0,
      1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0, // right
      1.0,  1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0, -1.0,
     -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0, // up
     -1.0,  1.0,  1.0,  1.0,  1.0, -1.0, -1.0,  1.0, -1.0,
     -1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0,  1.0, // down
     -1.0, -1.0, -1.0,  1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
    ]);

    const colors = new Float32Array([
      1.0, 0.5, 0.2, 1.0, 1.0, 0.5, 0.2, 1.0, 1.0, 0.5, 0.2, 1.0,
      1.0, 0.5, 0.2, 1.0, 1.0, 0.5, 0.2, 1.0, 1.0, 0.5, 0.2, 1.0,
      1.0, 0.5, 0.2, 1.0, 1.0, 0.5, 0.2, 1.0, 1.0, 0.5, 0.2, 1.0,
      1.0, 0.5, 0.2, 1.0, 1.0, 0.5, 0.2, 1.0, 1.0, 0.5, 0.2, 1.0,
      1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
      1.0, 0.5, 0.2, 1.0, 1.0, 0.5, 0.2, 1.0, 1.0, 0.5, 0.2, 1.0,
      1.0, 0.5, 0.2, 1.0, 1.0, 0.5, 0.2, 1.0, 1.0, 0.5, 0.2, 1.0,
    ]);

    const texture = [...Array(6)].map(() => [
      0.0, 0.0,  1.0, 0.0,  1.0, 1.0,
      0.0, 0.0,  1.0, 1.0,  0.0, 1.0,
    ]).flat();

    const indices = new Uint8Array([...Array(~~(positions.length / 3))].map((_, i) => i));

    const colors_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colors_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_vcolor, 4, gl.FLOAT, false, 0, 0);

    const positions_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positions_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

    const texture_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texture_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texture), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_texture, 2, gl.FLOAT, false, 0, 0);

    const index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // there sub-elements discribed: (offset and indices number)
    const primitives = {
      cube:  [0, 36],
      box:   [0, 24],
      plate: [0,  6],
    };

    return {
      draw: (primitive, texture, tmatrix, modelview) => {
        if (!(primitive in primitives)) primitive = 'cube';

        gl.uniformMatrix4fv(u_mvmatrix, false, modelview);
        gl.uniformMatrix3fv(u_tmatrix, false, tmatrix);
        gl.uniform4fv(u_fcolor, [1.0, 1.0, 1.0, 1.0]);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(u_texture, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
        gl.drawElements(gl.TRIANGLES, primitives[primitive][1], gl.UNSIGNED_BYTE, primitives[primitive][0]);
      }
    }
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
    // -- gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // -- Prevents s-coordinate wrapping (repeating).
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // -- Prevents t-coordinate wrapping (repeating).
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // Also see:
    // https://open.gl/textures
  }

  return {
    gl,
    clear,
    create_texture,
    create_vbo_cube,
  }
}


WebGL.test = (parent = document.body) => {
  throw Error('test not prepared for new initialization');
  const webgl = WebGL(400, 400, parent);
  const cube = webgl.init_vbo_for_cube();
  let rotation = 0;
  return setInterval(() => {
    webgl.set_modelview(
      mat.create_gl_identity()
        .gl_rotate(rotation, 'y')
        .gl_rotate(rotation, 'x')
        .gl_translate(0, 0, 80)
        .float32Array());
    webgl.clear();
    cube.draw([1.0, 0.5, 0.5, 1.0]);
    rotation += 0.005;
  }, 20);
}
