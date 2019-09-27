function Graphics(args) {
  const { vec3, mat4 } = glMatrix;


  // creating webgl
  const screen_width = 500;
  const screen_height = 500;
  const webgl = WebGL(screen_width, screen_height);


  // creating 2d
  const ctx = Canvas2d(screen_width, screen_height);


  // matrices
  const mat_projection = mat4.create();
  const mat_modelview = mat4.create();
  const mat_normal = mat4.create();


  // model
  const model_origin = args.origin || [+1.0, +1.0, +1.0];
  const model_rotation = args.rotation || [+0.0, +0.0, +0.0];


  // mouse
  const mouse = {
    event: null,
    onmousedown(e) {
      this.event = e;
    },
    onmouseup(e) {
      this.event = null;
    },
    onmousemove(e) {
      if (this.event) {
        const rotation_speed = 0.01;
        const dx = e.clientX - this.event.clientX;
        const dy = e.clientY - this.event.clientY;
        model_rotation[0] += +dy * rotation_speed;
        model_rotation[1] += +dx * rotation_speed;
        model_rotation[2] += 0;
        this.event = e;
      }
    },
  };

  window.addEventListener('mouseup', e => mouse.onmouseup(e), false);
  window.addEventListener('mousedown', e => mouse.onmousedown(e), false);
  window.addEventListener('mousemove', e => mouse.onmousemove(e), false);


  // matrices stack
  const matstack = {
    stack: [],
    push(m) { this.stack.push(mat4.clone(m)); },
    pop(m) { mat4.copy(m, this.stack.pop()); },
  };


  // projection
  mat4.perspective(mat_projection, Math.PI / 4, screen_width / screen_height, 0.1, 1000.0);
  mat4.translate(mat_projection, mat_projection, [args.x || 0, args.y || 0, args.z || -15]);


  // start rendering

  let __get_vbo = elapsed => null;

  let old_timestamp = 0;
  (function render(timestamp = 0) {
    const elapsed = timestamp - old_timestamp;
    old_timestamp = timestamp;

    // clear scene
    webgl.clear();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // push matrices
    matstack.push(mat_modelview);
    matstack.push(mat_projection);

    // rotate modelview
    mat4.translate(mat_modelview, mat_modelview, [+model_origin[0], +model_origin[1], +model_origin[2]]);
    mat4.rotateX(mat_modelview, mat_modelview, +model_rotation[0]);
    mat4.rotateY(mat_modelview, mat_modelview, +model_rotation[1]);
    mat4.rotateZ(mat_modelview, mat_modelview, +model_rotation[2]);
    mat4.translate(mat_modelview, mat_modelview, [-model_origin[0], -model_origin[1], -model_origin[2]]);

    // drawing
    const mesh_vbo = __get_vbo(elapsed);
    if (mesh_vbo) {
      webgl.bind_vbo(mesh_vbo);
      webgl.draw(mat_projection, mat_modelview, mesh_vbo.indices.length);
    }

    // pop matrices
    matstack.pop(mat_projection);
    matstack.pop(mat_modelview);

    // request next frame
    requestAnimationFrame(render);
  })();

  return {
    vbo_setter: f => __get_vbo = f,
    ctx,
  }
}
