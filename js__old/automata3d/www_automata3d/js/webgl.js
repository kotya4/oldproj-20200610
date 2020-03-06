
function WebGL(w, h, wrapper = document.body) {
  const cvs = document.createElement('canvas');
  wrapper.appendChild(cvs);
  cvs.height = h;
  cvs.width = w;
  const gl = cvs.getContext('webgl', { preserveDrawingBuffer: true });

  // raw shaders

  const vertex_shader_raw = `
attribute vec3 a_position;
attribute vec4 a_vcolor;
uniform mat4 u_mvmatrix;
uniform mat4 u_pmatrix;
varying vec4 v_vcolor;

void main(void) {
  gl_Position = u_pmatrix * u_mvmatrix * vec4(a_position, 1.0);
  v_vcolor = a_vcolor;
}`;

  const fragment_shader_raw = `
precision highp float;
uniform vec4 u_fcolor;
varying vec4 v_vcolor;

void main(void) {
  gl_FragColor = v_vcolor * u_fcolor;
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

  const a_position = gl.getAttribLocation(shader_program, 'a_position');
  gl.enableVertexAttribArray(a_position);

  const a_vcolor = gl.getAttribLocation(shader_program, 'a_vcolor');
  gl.enableVertexAttribArray(a_vcolor);

  // prepares and sends to shader the projection matrix

  const projection_matrix = mat.create_gl_identity()
    .gl_projection(Math.PI / 4, cvs.height / cvs.width, 0.1, 1000)
    .float32Array();

  gl.uniformMatrix4fv(u_pmatrix, false, projection_matrix);

  // prepares scene

  gl.enable(gl.DEPTH_TEST);
  gl.viewport(0,0, cvs.width, cvs.height);
  gl.clearColor(0, 0, 0, 0.0);

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

  function init_vbo_for_cube() {
/*
    const positions = new Float32Array([
      1.0,  1.0,  1.0, // 0
     -1.0,  1.0,  1.0, // 1
     -1.0, -1.0,  1.0, // 2
      1.0, -1.0,  1.0, // 3
      1.0, -1.0, -1.0, // 4
      1.0,  1.0, -1.0, // 5
     -1.0,  1.0, -1.0, // 6
     -1.0, -1.0, -1.0, // 7
    ]);
    const colors = new Float32Array([
      1.0, 0.5, 0.5, 1.0,
      1.0, 0.5, 0.5, 1.0,
      1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0,
      1.0, 0.5, 0.5, 1.0,
      1.0, 0.5, 0.5, 1.0,
      1.0, 1.0, 1.0, 1.0,
    ]);
    const indices = new Uint8Array([
      0, 1, 2,   0, 2, 3,    // front
      0, 3, 4,   0, 4, 5,    // right
      0, 5, 6,   0, 6, 1,    // up
      1, 6, 7,   1, 7, 2,    // left
      7, 4, 3,   7, 3, 2,    // down
      4, 7, 6,   4, 6, 5     // back
    ]);
*/
    const positions = new Float32Array([
      1.0,  1.0,  1.0, -1.0,  1.0,  1.0, -1.0, -1.0,  1.0, //front
      1.0,  1.0,  1.0, -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,
      1.0,  1.0,  1.0,  1.0, -1.0,  1.0,  1.0, -1.0, -1.0, //right
      1.0,  1.0,  1.0,  1.0, -1.0, -1.0,  1.0,  1.0, -1.0,
      1.0,  1.0,  1.0,  1.0,  1.0, -1.0, -1.0,  1.0, -1.0, //up
      1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0,  1.0,  1.0,
     -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0, -1.0, -1.0, //left
     -1.0,  1.0,  1.0, -1.0, -1.0, -1.0, -1.0, -1.0,  1.0,
     -1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0,  1.0, //down
     -1.0, -1.0, -1.0,  1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
      1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0,  1.0, -1.0, //back
      1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,
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
    const indices = new Uint8Array([...Array(~~(positions.length / 3))].map((_, i) => i));

    const colors_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colors_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_vcolor, 4, gl.FLOAT, false, 0, 0);

    const positions_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positions_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

    const index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return {
      draw: (color = [1, 1, 1, 1]) => {
        gl.uniform4f(u_fcolor, ...color);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
      }
    }
  }

  return {
    gl,
    ratio,
    clear,
    set_modelview,
    init_vbo_for_cube,
  }
}


WebGL.test = (wrapper = document.body) => {
  const webgl = WebGL(400, 400, wrapper);
  const cube = webgl.init_vbo_for_cube();
  let rotation = 0;
  return setInterval(() => {
    webgl.set_modelview(
      mat.create_gl_identity()
        .gl_rotate(rotation, 'y')
        .gl_rotate(rotation, 'x')
        .gl_translate(0, 0, -80)
        .float32Array());
    webgl.clear();
    cube.draw([1.0, 0.5, 0.5, 1.0]);
    rotation += 0.005;
  }, 20);
}
