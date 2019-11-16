//
function Graphics(screen_width, screen_height, parent) {
  parent = parent || document.body;

  if (!WebGL) throw Error('Graphics:: WebGL undefined');

  const { gl, webgl, ctx } = WebGL(screen_width, screen_height, parent);

  const shader_program = webgl.create_shader_program(
    webgl.compile_shader(gl.VERTEX_SHADER, VERTEX_SHADER),
    webgl.compile_shader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER),
  );

  const u_loc = WebGL.create_accessor(webgl.define_uniform_locations(shader_program, {
    u_texture:      null,
    u_normalmap:    null,
    u_modelview:    null,
    u_projection:   null,
    u_normalmatrix: null,
    u_camera_pos:   null,
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
  }));

  const a_loc = WebGL.create_accessor(webgl.define_attrib_locations(shader_program, {
    a_color:   null,
    a_texuv:   null,
    a_coord:   null,
    a_normal:  null,
    a_tangent: null,
  }));

  const cube = WebGL.create_cube();
  // console.log(cube);

  const cube_vao = webgl.bind_vao();
  webgl.bind_array_buffer(a_loc('a_color'), new Float32Array(cube.colors), 4, gl.FLOAT);
  webgl.bind_array_buffer(a_loc('a_texuv'), new Float32Array(cube.texcoords), 2, gl.FLOAT);
  webgl.bind_array_buffer(a_loc('a_coord'), new Float32Array(cube.coordinates), 3, gl.FLOAT);
  webgl.bind_array_buffer(a_loc('a_normal'), new Float32Array(cube.normals), 3, gl.FLOAT);
  webgl.bind_array_buffer(a_loc('a_tangent'), new Float32Array(cube.tangents), 3, gl.FLOAT);
  webgl.bind_element_buffer(new Uint16Array(cube.indices));

  // lamp normals are the same as cube except that they are inversed (to see pointlight inside of lamp)
  const lamp_vao = webgl.bind_vao();
  webgl.bind_array_buffer(a_loc('a_color'), new Float32Array(cube.colors), 4, gl.FLOAT);
  webgl.bind_array_buffer(a_loc('a_texuv'), new Float32Array(cube.texcoords), 2, gl.FLOAT);
  webgl.bind_array_buffer(a_loc('a_coord'), new Float32Array(cube.coordinates), 3, gl.FLOAT);
  webgl.bind_array_buffer(a_loc('a_normal'), new Float32Array(cube.normals.map(e => -e)), 3, gl.FLOAT);
  webgl.bind_array_buffer(a_loc('a_tangent'), new Float32Array(cube.tangents), 3, gl.FLOAT);
  webgl.bind_element_buffer(new Uint16Array(cube.indices));

  const projection = mat4.perspective([], Math.PI / 4, screen_width / screen_height, 0.1, 100.0);

  const Stack = WebGL.create_stack_mat4();
  const Camera = WebGL.create_camera();

  const camera_data = JSON.parse(localStorage.getItem('camera'));
  if (camera_data) {
    Camera.position = camera_data.position;
    Camera.pitch = camera_data.pitch;
    Camera.roll = camera_data.roll;
    Camera.yaw = camera_data.yaw;
  } else {
    Camera.position = [-0.94, +1.43, -0.83];
    Camera.pitch = 0.12;
    Camera.roll = 0;
    Camera.yaw = 0.84;
  }
  // console.log('localStorage:', localStorage);

  /////////////////////////////////////
  // MOUSE                           //
  /////////////////////////////////////

  const Mouse = {
    event: null,
    coordinates: [-1, -1],
    ///////////////////////
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

  /////////////////////////////////////
  // KEYBOARD                        //
  /////////////////////////////////////

  const Keyboard = {
    keys: [],
    /////////////////////
    onkeydown(e) {
      this.keys[e.code] = true;
    },
    onkeyup(e) {
      this.keys[e.code] = false;
    },
  };

  window.addEventListener('keydown', e => Keyboard.onkeydown(e));
  window.addEventListener('keyup', e => Keyboard.onkeyup(e));

  /////////////////////////////////////
  // TEXTURES                        //
  /////////////////////////////////////

  const textures = WebGL.create_accessor({
    normalmap2: 'data/normalmap3.png',
    normalmap: 'data/normalmap.png',
    hello: 'data/image.png',
    cat: 'data/cat.png',
  });

  for (let key in textures._itself_) {
    const path = textures._itself_[key];
    const img = new Image();
    img.src = _DATA_[path];

    textures._itself_[key] = webgl.EMPTY_TEXTURE;

    (new Promise(r => img.onload = r)).then(_ => {
      textures._itself_[key] = webgl.create_texture(img);
    });
  }

  /////////////////////////////////////
  // POINTLIGHTS                     //
  /////////////////////////////////////

  const pointlights_positions = [
    [1.2, 0.2, 1.5],
    [4.796032801003256, 1.5797091248867945, 3.0253459502511237],
    [5.175393677771427, 6.373200910903842, 9.399138501689722],
    [2.095793961189991, 2.048911979856176, 1.030745635332122],
    [3.1468480761326223, 5.705468472502282, 4.861547644044841],
    [3.375339173127301, 4.830298804371416, 8.948784809791784],
  ];

  const pointlights = Array(POINTLIGHTS_NUM).fill().map((_, i) => ({
    position:  pointlights_positions[i],
    constant:  +1.0,
    linear:    +0.09,
    quadratic: +0.032,
    ambient:   Array(3).fill().map(_ => Math.random() / 10),
    diffuse:   Array(3).fill().map(_ => Math.random()),
    specular:  Array(3).fill().map(_ => Math.random()),
    // speedX: 0,
    // speedY: 0.1,
    // speedZ: 0.0,
    speedX: Math.random() - 0.5,
    speedY: Math.random() - 0.5,
    speedZ: Math.random() - 0.5,
  }));

  pointlights.forEach((e, i) => {
    gl.uniform3fv(u_loc('u_pointlights')[i].position,  e.position);
    gl.uniform1f (u_loc('u_pointlights')[i].constant,  e.constant);
    gl.uniform1f (u_loc('u_pointlights')[i].linear,    e.linear);
    gl.uniform1f (u_loc('u_pointlights')[i].quadratic, e.quadratic);
    gl.uniform3fv(u_loc('u_pointlights')[i].ambient,   e.ambient);
    gl.uniform3fv(u_loc('u_pointlights')[i].diffuse,   e.diffuse);
    gl.uniform3fv(u_loc('u_pointlights')[i].specular,  e.specular);
  });

  const translations = [
    [0, 0, 0],
    [4.94040087812412, 3.987188163399047, 5.333563764015848],
    [9.882665749439973, 7.263054517516854, 5.2142342944726465],
    [1.3382280357991116, 8.509423671314234, 5.017507653240967],
    [4.58438238969226, 3.41690707038363, 1.7294431402702437],
    [7.672708820361665, 0.6608901992581906, 1.4528536130439695],
    [7.166167387728408, 5.506432974792741, 1.7030394827420703],
    [2.888077919145806, 4.892005511920696, 7.2259086936694334],
    [1.7169416273334237, 3.255576258782875, 4.683421921343067],
    [2.6787295282562207, 0.9188925814701787, 7.006245703839209],
    [7.013909696845719, 8.990429841975299, 1.279045888650614],
  ];

  const rotations = [
    [0, 0, 0],

    [5.866353746304541, 5.631868554762942, 6.185695486126797],
    [5.747020701275975, 0.8210267437015922, 0.22965576767342694],
    [6.04427580420977, 3.846960849313004, 1.673279563102401],
    [5.593743781766915, 2.201574459681011, 1.3033987277337395],
    [2.914617622332446, 3.967316944793016, 6.251481162542859],
    [1.9041419751252278, 3.5333703835812877, 3.843013885856683],
    [5.745853249217163, 0.68001135117034, 1.342017306606728],
    [2.26381744129542, 5.133209780168478, 4.033699225254241],
    [1.7615236836422663, 1.0567748494464113, 3.1109475452779445],
    [4.796605142314438, 5.8870325569099675, 3.257300836630287],
  ];

  /////////////////////////////////////
  // CUBES (MODELVIEWS)              //
  /////////////////////////////////////

  const cubes_modelviews = Array(10).fill().map((_, i) => {
    const m = mat4.create();
    const translation = translations[i];
    const rotation = rotations[i];
    mat4.translate(m, m, translation);
    mat4.rotateX(m, m, rotation[0]);
    mat4.rotateY(m, m, rotation[1]);
    mat4.rotateZ(m, m, rotation[2]);
    return m;
  });

  /////////////////////////////
  // CodeDrawer              //
  /////////////////////////////

  // вщ тще ащкпуе gl.clearColor(0, 0, 0, 0);
  // const BGCTX=document.createElement('canvas').getContext('2d');BGCTX.canvas.width=webgl.viewport[2]
  // ;BGCTX.canvas.height=webgl.viewport[3];BGCTX.canvas.imageSmoothingEnabled=false;BGCTX.canvas.style
  // .zIndex=-100;document.body.appendChild(BGCTX.canvas);function BGCTXrender(){BGCTX.fillStyle='black'
  // ;BGCTX.fillRect(...webgl.viewport);const fontsize=10;BGCTX.font=`${fontsize}px "Terminal"`;BGCTX.
  // fillStyle='rgba(255,255,255,0.1)';CodeDrawer(webgl.viewport[3]/fontsize|0).forEach((str,i)=>{BGCTX
  // .fillText(str,0,(i+1)*fontsize);});}BGCTXrender();setInterval(BGCTXrender,500);

  /////////////////////////////////////////////////////////////////
  // RENDER                                                      //
  /////////////////////////////////////////////////////////////////

  let FPS = 0;
  let FPS_update_timer = 0;
  let FPS_update_counter = 0;
  let camera_update_timer = 0;
  let old_timestamp = 0;
  let elapsed_acc = 0;

  function render(timestamp = 0) {
    const elapsed = Math.min(timestamp - old_timestamp, 100);
    old_timestamp = timestamp;
    elapsed_acc += elapsed;

    ctx.save();
    ctx.clearRect(...webgl.viewport);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /////////////////////////////
    // CAMERA                  //
    /////////////////////////////

    Stack.push(projection);

    // sets camera
    if (Keyboard.keys['KeyW']) Camera.d_forward += 0.01 * elapsed;
    if (Keyboard.keys['KeyS']) Camera.d_forward -= 0.01 * elapsed;
    if (Keyboard.keys['KeyA']) Camera.d_strafe -= 0.01 * elapsed;
    if (Keyboard.keys['KeyD']) Camera.d_strafe += 0.01 * elapsed;
    if (Keyboard.keys['KeyE']) Camera.d_up += 0.01 * elapsed;
    if (Keyboard.keys['KeyQ']) Camera.d_up -= 0.01 * elapsed;
    Camera.apply(projection);
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

    gl.uniform3fv(u_loc('u_camera_pos'), Camera.position);

    /////////////////////////////
    // POINTLIGHTS (LAMPS)     //
    /////////////////////////////

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, webgl.EMPTY_TEXTURE);
    gl.uniform1i(u_loc('u_texture'), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, webgl.EMPTY_NORMALMAP);
    gl.uniform1i(u_loc('u_normalmap'), 1);

    gl.bindVertexArray(lamp_vao);

    pointlights.forEach((e, i) => {
      e.position[0] += Math.cos(elapsed_acc * 0.001) * 0.01 * e.speedX * elapsed;
      e.position[1] += Math.sin(elapsed_acc * 0.001) * 0.01 * e.speedY * elapsed;
      e.position[2] += Math.sin(elapsed_acc * 0.001) * 0.01 * e.speedZ * elapsed;
      gl.uniform3fv(u_loc('u_pointlights')[i].position, e.position);
      // lamps
      const lamp_scale = 0.3;
      const modelview = mat4.create();
      mat4.translate(modelview, modelview, e.position.map(e => (e - lamp_scale / 2)));
      mat4.scale(modelview, modelview, Array(3).fill(lamp_scale));
      const normalmatrix = mat3.transpose([], mat3.invert([], WebGL.cvt_mat4_to_mat3([], modelview)));
      gl.uniformMatrix4fv(u_loc('u_modelview'), false, modelview);
      gl.uniformMatrix4fv(u_loc('u_projection'), false, projection);
      gl.uniformMatrix3fv(u_loc('u_normalmatrix'), false, normalmatrix);

      gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);

    });

    /////////////////////////////
    // CUBES                   //
    /////////////////////////////

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures('cat'));
    gl.uniform1i(u_loc('u_texture'), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures('normalmap2'));
    gl.uniform1i(u_loc('u_normalmap'), 1);

    gl.bindVertexArray(cube_vao);

    for (let i = 0; i < cubes_modelviews.length; ++i) {
      const modelview = cubes_modelviews[i];
      const normalmatrix = mat3.transpose([], mat3.invert([], WebGL.cvt_mat4_to_mat3([], modelview)));
      // const projectionview = mat4.multiply([], projection, modelview); // (debug)
      gl.uniformMatrix4fv(u_loc('u_modelview'), false, modelview);
      gl.uniformMatrix4fv(u_loc('u_projection'), false, projection);
      gl.uniformMatrix3fv(u_loc('u_normalmatrix'), false, normalmatrix);

      gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);

      // btn (debug)
      // WebGL.draw_btn(ctx, webgl.viewport, projectionview, cube);
    }

    /////////////////////////////
    // ZERO POINT (DEBUG)      //
    /////////////////////////////

    // const zp = WebGL.project([], [0, 0, 0], webgl.viewport, projection);
    // ctx.strokeStyle = ctx.fillStyle = 'white';
    // ctx.beginPath();
    // ctx.moveTo(zp[0], zp[1]);
    // ctx.ellipse(zp[0], zp[1], 2, 2, 0, 0, Math.PI * 2);
    // ctx.fill();

    Stack.pop(projection);

    /////////////////////////////
    // DEBUG INFORMATION       //
    /////////////////////////////

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
    Stack.push(projection);
    mat4.translate(projection, projection, [0, 0, -20]);
    mat4.rotateX(projection, projection, Camera.pitch);
    mat4.rotateY(projection, projection, Camera.yaw);
    mat4.rotateZ(projection, projection, Camera.roll);
    const axis_pos = [35 - screen_width / 2, screen_height / 2 - 35];
    const v1 = [];
    const v2 = [];
    ctx.lineWidth = 2;
    WebGL.project(v1, [0, 0, 0], webgl.viewport, projection);
    // x
    WebGL.project(v2, [-1, 0, 0], webgl.viewport, projection); // why inversed?
    ctx.strokeStyle = ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(v1[0] + axis_pos[0], v1[1] + axis_pos[1]);
    ctx.lineTo(v2[0] + axis_pos[0], v2[1] + axis_pos[1]);
    ctx.stroke();
    ctx.fillText('X', v2[0] + axis_pos[0], v2[1] + axis_pos[1]);
    // y
    WebGL.project(v2, [0, 1, 0], webgl.viewport, projection);
    ctx.strokeStyle = ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(v1[0] + axis_pos[0], v1[1] + axis_pos[1]);
    ctx.lineTo(v2[0] + axis_pos[0], v2[1] + axis_pos[1]);
    ctx.stroke();
    ctx.fillText('Y', v2[0] + axis_pos[0], v2[1] + axis_pos[1]);
    // z
    WebGL.project(v2, [0, 0, 1], webgl.viewport, projection);
    ctx.strokeStyle = ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(v1[0] + axis_pos[0], v1[1] + axis_pos[1]);
    ctx.lineTo(v2[0] + axis_pos[0], v2[1] + axis_pos[1]);
    ctx.stroke();
    ctx.fillText('Z', v2[0] + axis_pos[0], v2[1] + axis_pos[1]);
    Stack.pop(projection);

    /////////////////////////////
    // END OF DRAW             //
    /////////////////////////////

    ctx.restore();
    requestAnimationFrame(render);
  }

  //////////////////////////////////////////////////////////////////////////

  return {
    render,
  }
}
