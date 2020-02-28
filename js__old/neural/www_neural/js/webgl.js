
function WebGL(w, h, wrapper_class) {
  const cvs = document.createElement('canvas');
  document.getElementsByClassName(wrapper_class)[0].appendChild(cvs);
  cvs.width = w;
  cvs.height = h;
  const gl = cvs.getContext('webgl', { preserveDrawingBuffer: true });

  // raw shaders

  const vertex_shader_raw = `
attribute vec3 a_position;
uniform mat4 u_transform;
void main(void) {
  gl_Position = u_transform * vec4(a_position, 1.0);
}`;

  const fragment_shader_raw = `
void main(void) {
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}`;

  // compiled shaders

  const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertex_shader, vertex_shader_raw);
  gl.compileShader(vertex_shader);

  const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragment_shader, fragment_shader_raw);
  gl.compileShader(fragment_shader);

  // creates and uses shader program

  const shader_program = gl.createProgram();
  gl.attachShader(shader_program, vertex_shader);
  gl.attachShader(shader_program, fragment_shader);
  gl.linkProgram(shader_program);
  gl.useProgram(shader_program);

  // binds vertex buffer object

  const vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  const a_position = gl.getAttribLocation(shader_program, 'a_position');
  const u_transform = gl.getUniformLocation(shader_program, 'u_transform');
  gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_position);

  // prepares and sends to shader the projection matrix

  const projection_matrix = mat.create_gl_identity()
    .gl_rotate(+0.4, 'y')
    .gl_rotate(-0.6, 'x')
    .gl_translate(0, 0, 5)
    .gl_projection(Math.PI / 4, cvs.height / cvs.width, 0.1, 100)
    .float32Array();

  gl.uniformMatrix4fv(u_transform, false, projection_matrix);

  // prepares for drawing

  gl.enable(gl.DEPTH_TEST);
  gl.viewport(0,0, cvs.width, cvs.height);
  gl.clearColor(0, 0, 0, 1.0);

  // -- methods --

  function clear() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  function prepare_line_strip_cube(s = 1) {
    return new Float32Array([
      -s, -s, -s,
      -s, +s, -s,
      +s, +s, -s,
      +s, -s, -s,
      -s, -s, -s,
      -s, -s, +s,
      +s, -s, +s,
      +s, -s, -s,
      +s, +s, -s,
      +s, +s, +s,
      +s, -s, +s,
      -s, -s, +s,
      -s, +s, +s,
      +s, +s, +s,
      -s, +s, +s,
      -s, +s, -s,
    ]);
  }

  function prepare_vertices(array) {
    return new Float32Array(array);
  }

  function buffer_and_draw_vertices(vertices, type) {
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.drawArrays(type, 0, ~~(vertices.length / 3));
    // POINTS, LINE_STRIP, LINE_LOOP, LINES,
    // TRIANGLE_STRIP,TRIANGLE_FAN, TRIANGLES
  }

  function uniform_tranformation_matrix(a) {
    gl.uniformMatrix4fv(u_transform, false, a);
  }

  function test_continuously() {
    const vertices = prepare_line_strip_cube();
    let rotx = 0;
    return setInterval(() => {
      gl.uniformMatrix4fv(u_transform, false, mat.create_gl_identity()
        .gl_rotate(rotx, 'y')
        .gl_rotate(rotx, 'x')
        .gl_translate(0, 0, 5.4)
        .gl_projection(Math.PI / 4, cvs.height / cvs.width, 0.1, 100)
        .float32Array());
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      gl.drawArrays(gl.LINE_STRIP, 0, ~~(vertices.length / 3));
      rotx += 0.005;
    }, 17);
  }

  function ratio() {
    return cvs.height / cvs.width;
  }

  return {
    gl,
    clear,
    ratio,
    prepare_vertices,
    test_continuously,
    prepare_line_strip_cube,
    buffer_and_draw_vertices,
    uniform_tranformation_matrix
  }
}
