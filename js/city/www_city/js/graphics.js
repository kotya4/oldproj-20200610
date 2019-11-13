//
function Graphics(screen_width, screen_height, parent) {
  parent = parent || document.body;

  if (!WebGL) throw Error('Graphics:: WebGL undefined');

  const { gl, webgl, ctx } = WebGL(screen_width, screen_height, parent);

  const shader_program = webgl.create_shader_program(
    webgl.compile_shader(gl.VERTEX_SHADER, DATA__vertex_shader),
    webgl.compile_shader(gl.FRAGMENT_SHADER, DATA__fragment_shader),
  );

  const u_loc = webgl.define_uniform_locations(shader_program, {
    u_camera_position: null,
    u_projectionview:  null,
    u_normal_matrix:   null,
    u_modelview:       null,
    u_sampler:         null,
    u_pointlights: {
      _array_: 5,
      position:  null,
      constant:  null,
      linear:    null,
      quadratic: null,
      ambient:   null,
      diffuse:   null,
      specular:  null,
    },
  });

  const a_loc = webgl.define_attrib_locations(shader_program, {
    texuv: 'a_texuv',
    coord: 'a_coord',
    color: 'a_color',
    normal: 'a_normal',
  });

  const cube = WebGL.create_cube();
  const lamp = WebGL.create_cube();
  lamp.normals = lamp.normals.map(e => -e);

  const mat_projection = mat4.perspective([], Math.PI / 4, screen_width / screen_height, 0.1, 100.0);
  const mat_modelview = mat4.create();

  const Stack = WebGL.create_stack_mat4();
  const Camera = WebGL.create_camera();

  console.log('localStorage:', localStorage);

  const camera_data = JSON.parse(localStorage.getItem('camera'));
  if (camera_data) {
    Camera.position = camera_data.position;
    Camera.pitch = camera_data.pitch;
    Camera.roll = camera_data.roll;
    Camera.yaw = camera_data.yaw;
  }

  // =======================================

  const Mouse = {
    event: null,
    coordinates: [-1, -1],

    onmouseup(e) {
      this.event = null;
    },
    onmousedown(e) {
      this.event = e;
    },
    onmousemove(e) {
      const rect = webgl.get_bounding_rect();
      this.coordinates[0] = e.clientX - rect.x;
      this.coordinates[1] = e.clientY - rect.y;

      if (this.event) {
        const dx = (e.clientX - this.event.clientX);
        const dy = (e.clientY - this.event.clientY);

        if (dy < 0 && Camera.pitch < +Math.PI / 2 || dy > 0 && Camera.pitch > -Math.PI / 2) { // cannot flip over
          Camera.pitch -= dy * 0.005;
        }
        Camera.yaw -= dx * 0.005;

        this.event = e;
      }
    },
    onweel(e) {
      const dy = e.deltaY;
    },
  };

  window.addEventListener('mousedown', e => Mouse.onmousedown(e));
  window.addEventListener('mousemove', e => Mouse.onmousemove(e));
  window.addEventListener('mouseup', e => Mouse.onmouseup(e));
  window.addEventListener('wheel', e => Mouse.onweel(e));

  // =======================================

  const Keyboard = {
    keys: [],
    onkeydown(e) {
      this.keys[e.code] = true;
    },
    onkeyup(e) {
      this.keys[e.code] = false;
    },
  };

  window.addEventListener('keydown', e => Keyboard.onkeydown(e));
  window.addEventListener('keyup', e => Keyboard.onkeyup(e));

  // =======================================

  let texture = null;
  const img = new Image();
  img.src = _DATA_['data/image.png'];
  Promise.all([
    new Promise(r => img.onload = r),
  ]).then(() => {

    texture = webgl.create_texture(img);

  });

  // ========================================

  const pointlights = Array(5).fill().map(_ => ({
    position:  [Math.random() * 10, Math.random() * 10, Math.random() * 10],
    constant:  +1.0,
    linear:    +0.09,
    quadratic: +0.032,
    ambient:   [0.0, 0.0, 0.0],
    diffuse:   Array(3).fill().map(_ => Math.random()),
    specular:  Array(3).fill().map(_ => Math.random()),
  }));

  // const pointlight = {
  //   position:  [+5.0, +5, +5.0],
  //   constant:  +1.0,
  //   linear:    +0.09,
  //   quadratic: +0.032,
  //   ambient:   [0.0, 0.0, 0.0],
  //   diffuse:   [0.0, 0.0, 1.0],
  //   specular:  [1.0, 0.0, 0.0],
  // };

  const models = Array(10).fill().map(() => {
    const m = mat4.create();
    mat4.translate(m, m, [Math.random() * 10, Math.random() * 10, Math.random() * 10]);
    mat4.rotateX(m, m, Math.random() * Math.PI * 2);
    mat4.rotateY(m, m, Math.random() * Math.PI * 2);
    mat4.rotateZ(m, m, Math.random() * Math.PI * 2);
    return m;
  });


  //==============================================================


  // ------------ render -----------------

  let FPS = 0;
  let FPS_update_timer = 0;
  let FPS_update_counter = 0;
  let camera_update_timer = 0;
  let old_timestamp = 0;

  function render(timestamp = 0) {
    const elapsed = timestamp - old_timestamp;
    old_timestamp = timestamp;

    ctx.save();
    ctx.clearRect(...webgl.viewport);

    //==============================================================


    // fps
    FPS_update_timer += elapsed;
    ++FPS_update_counter;
    if (FPS_update_timer > 200) {
      FPS = 1000 / (FPS_update_timer / FPS_update_counter) | 0;
      FPS_update_counter = 0;
      FPS_update_timer = 0;
    }
    ctx.font = '14px "Consolas"';
    ctx.fillStyle = 'white';
    ctx.fillText(FPS, 0, 10);
    // camera
    ctx.fillText('pos: ' + Camera.position.map(e => (e * 100 | 0) / 100), 0, 20);
    ctx.fillText('rot: ' + [Camera.pitch, Camera.yaw].map(e => (e * 100 | 0) / 100), 0, 32);
    // keyboard
    let keyboad_offset = 0;
    for (let key in Keyboard.keys)
      if (Keyboard.keys[key])
        ctx.fillText(key, 0, 36 + (++keyboad_offset) * 14);
    // axis
    Stack.push(mat_projection);
    mat4.translate(mat_projection, mat_projection, [0, 0, -20]);
    mat4.rotateX(mat_projection, mat_projection, Camera.pitch);
    mat4.rotateY(mat_projection, mat_projection, Camera.yaw);
    mat4.rotateZ(mat_projection, mat_projection, Camera.roll);
    const axis_pos = [35 - screen_width / 2, screen_height / 2 - 35];
    const v1 = [];
    const v2 = [];
    ctx.lineWidth = 2;
    WebGL.project(v1, [0, 0, 0], webgl.viewport, mat_projection);
    // x
    WebGL.project(v2, [1, 0, 0], webgl.viewport, mat_projection);
    ctx.strokeStyle = ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(v1[0] + axis_pos[0], v1[1] + axis_pos[1]);
    ctx.lineTo(v2[0] + axis_pos[0], v2[1] + axis_pos[1]);
    ctx.stroke();
    ctx.fillText('X', v2[0] + axis_pos[0], v2[1] + axis_pos[1]);
    // y
    WebGL.project(v2, [0, 1, 0], webgl.viewport, mat_projection);
    ctx.strokeStyle = ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(v1[0] + axis_pos[0], v1[1] + axis_pos[1]);
    ctx.lineTo(v2[0] + axis_pos[0], v2[1] + axis_pos[1]);
    ctx.stroke();
    ctx.fillText('Y', v2[0] + axis_pos[0], v2[1] + axis_pos[1]);
    // z
    WebGL.project(v2, [0, 0, 1], webgl.viewport, mat_projection);
    ctx.strokeStyle = ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(v1[0] + axis_pos[0], v1[1] + axis_pos[1]);
    ctx.lineTo(v2[0] + axis_pos[0], v2[1] + axis_pos[1]);
    ctx.stroke();
    ctx.fillText('Z', v2[0] + axis_pos[0], v2[1] + axis_pos[1]);
    Stack.pop(mat_projection);

    //==============================================================

    Stack.push(mat_projection);

    // sets camera
    if (Keyboard.keys['KeyW']) Camera.d_forward += 0.01 * elapsed;
    if (Keyboard.keys['KeyS']) Camera.d_forward -= 0.01 * elapsed;
    if (Keyboard.keys['KeyA']) Camera.d_strafe -= 0.01 * elapsed;
    if (Keyboard.keys['KeyD']) Camera.d_strafe += 0.01 * elapsed;
    if (Keyboard.keys['KeyE']) Camera.d_up += 0.01 * elapsed;
    if (Keyboard.keys['KeyQ']) Camera.d_up -= 0.01 * elapsed;
    Camera.apply(mat_projection);
    // save camera
    camera_update_timer += elapsed;
    if (camera_update_timer > 1000) {
      camera_update_timer = 0;
      localStorage.setItem('camera', JSON.stringify({
        position: Camera.position,
        pitch: Camera.pitch,
        roll: Camera.roll,
        yaw: Camera.yaw,
      }));
    }


    pointlights.forEach(e => {
      e.position[0] += Math.cos(timestamp * 0.001) * 0.1 * e.diffuse[0];
      e.position[1] += Math.sin(timestamp * 0.001) * 0.1 * e.diffuse[0];
      e.position[2] += Math.sin(timestamp * 0.001) * 0.1 * e.diffuse[0];
    });


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(u_loc.sampler, 0);


    pointlights.forEach((e, i) => {

      gl.uniform3fv(u_loc.u_pointlights[i].position,  e.position);
      gl.uniform1f (u_loc.u_pointlights[i].constant,  e.constant);
      gl.uniform1f (u_loc.u_pointlights[i].linear,    e.linear);
      gl.uniform1f (u_loc.u_pointlights[i].quadratic, e.quadratic);
      gl.uniform3fv(u_loc.u_pointlights[i].ambient,   e.ambient);
      gl.uniform3fv(u_loc.u_pointlights[i].diffuse,   e.diffuse);
      gl.uniform3fv(u_loc.u_pointlights[i].specular,  e.specular);

    });

    gl.uniform3fv(u_loc.camera_position, Camera.position);

    webgl.bind_array_buffer(a_loc.texuv, new Float32Array(cube.texcoords), 2, gl.FLOAT);
    webgl.bind_array_buffer(a_loc.color, new Float32Array(cube.colors), 4, gl.FLOAT);
    webgl.bind_array_buffer(a_loc.coord, new Float32Array(cube.coordinates), 3, gl.FLOAT);
    webgl.bind_array_buffer(a_loc.normal, new Float32Array(cube.normals), 3, gl.FLOAT);
    webgl.bind_element_buffer(new Uint16Array(cube.indices));

    for (let i = 0; i < models.length; ++i) {
      const modelview = models[i];

      gl.uniformMatrix4fv(u_loc.u_projectionview, false, mat4.multiply([], mat_projection, modelview));
      gl.uniformMatrix4fv(u_loc.u_normal_matrix, false, mat4.transpose([], mat4.invert([], modelview)));
      gl.uniformMatrix4fv(u_loc.u_modelview, false, modelview);
      gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);
    }

    const pointlight_pos = WebGL.project([], [0, 0, 0], webgl.viewport, mat_projection);
    ctx.strokeStyle = ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(pointlight_pos[0], pointlight_pos[1]);
    ctx.ellipse(pointlight_pos[0], pointlight_pos[1], 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    webgl.bind_array_buffer(a_loc.texuv, new Float32Array(lamp.texcoords), 2, gl.FLOAT);
    webgl.bind_array_buffer(a_loc.color, new Float32Array(lamp.colors), 4, gl.FLOAT);
    webgl.bind_array_buffer(a_loc.coord, new Float32Array(lamp.coordinates), 3, gl.FLOAT);
    webgl.bind_array_buffer(a_loc.normal, new Float32Array(lamp.normals), 3, gl.FLOAT);
    webgl.bind_element_buffer(new Uint16Array(lamp.indices));


    pointlights.forEach(e => {

      const lamp_scale = 0.3;
      const modelview = mat4.create();
      mat4.translate(modelview, modelview, e.position.map(e => (e - lamp_scale / 2)));
      mat4.scale(modelview, modelview, Array(3).fill(lamp_scale));
      gl.uniformMatrix4fv(u_loc.u_projectionview, false, mat4.multiply([], mat_projection, modelview));
      gl.uniformMatrix4fv(u_loc.u_normal_matrix, false, mat4.transpose([], mat4.invert([], modelview)));
      gl.uniformMatrix4fv(u_loc.u_modelview, false, modelview);
      gl.drawElements(gl.TRIANGLES, lamp.indices.length, gl.UNSIGNED_SHORT, 0);


    });


    Stack.pop(mat_projection);

    ctx.restore();
    requestAnimationFrame(render);
  }

  return {
    render,
  }
}
