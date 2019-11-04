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
    view: 'u_view',
    normal: 'u_normal',
    ambient_light: 'u_ambient_light',
    directional_light: {
      color: 'u_directional_light.color',
      direction: 'u_directional_light.direction',
    },
    offsets: 'u_offsets',
    sampler: 'u_sampler',
  });

  const a_loc = webgl.define_attrib_locations(shader_program, {
    texuv: 'a_texuv',
    coord: 'a_coord',
    color: 'a_color',
    normal: 'a_normal',
  });

  const directional_light_direction = [0.5, -0.75, 1];
  webgl.set_ambient_light(u_loc.ambient_light, [0.5, 0.5, 0.5]);
  webgl.set_directional_light(u_loc.directional_light, [1.0, 1.0, 1.0], directional_light_direction);

  const cube = WebGL.create_cube();
  webgl.bind_array_buffer(a_loc.texuv, new Float32Array(cube.texcoords), 2, gl.FLOAT);
  webgl.bind_array_buffer(a_loc.color, new Float32Array(cube.colors), 4, gl.FLOAT);
  webgl.bind_array_buffer(a_loc.coord, new Float32Array(cube.coordinates), 3, gl.FLOAT);
  webgl.bind_array_buffer(a_loc.normal, new Float32Array(cube.normals), 3, gl.FLOAT);
  webgl.bind_element_buffer(new Uint16Array(cube.indices));

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

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (texture) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(u_loc.sampler, 0);
    }

    gl.uniformMatrix4fv(u_loc.view, false, mat4.multiply([], mat_projection, mat_modelview));
    gl.uniformMatrix4fv(u_loc.normal, false, mat4.transpose([], mat4.invert([], mat_modelview)));
    gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);

    Stack.pop(mat_projection);

    ctx.restore();
    requestAnimationFrame(render);
  }

  return {
    render,
  }
}
