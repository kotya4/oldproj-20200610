//
function Graphics(screen_width, screen_height, parent) {
  parent = parent || document.body;

  if (!WebGL) throw Error('Graphics:: WebGL undefined');
  if (!Canvas) throw Error('Graphics:: Canvas undefined');

  const { gl, webgl } = WebGL(screen_width, screen_height, parent);
  const ctx = Canvas(screen_width, screen_height, parent);

  const bounding_client_rect = ctx.canvas.getBoundingClientRect(); // must be same as gl.canvas

  const shader_program = webgl.create_shader_program(
    webgl.compile_shader(gl.VERTEX_SHADER, DATA__vertex_shader),
    // webgl.compile_shader(gl.VERTEX_SHADER, DATA__vertex_shader_with_instancing),
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
  });

  const a_loc = webgl.define_attrib_locations(shader_program, {
    coord: 'a_coord',
    color: 'a_color',
    normal: 'a_normal',
  });

  const directional_light_direction = [0.5, 0.75, 1];

  webgl.set_ambient_light(u_loc.ambient_light, [0.5, 0.5, 0.5]);
  webgl.set_directional_light(u_loc.directional_light, [1.0, 1.0, 1.0], directional_light_direction);





  const cube = WebGL.create_cube();

  webgl.bind_array_buffer(a_loc.color, new Float32Array(cube.colors), 4, gl.FLOAT);
  webgl.bind_array_buffer(a_loc.coord, new Float32Array(cube.coordinates), 3, gl.FLOAT);
  webgl.bind_array_buffer(a_loc.normal, new Float32Array(cube.normals), 3, gl.FLOAT);
  webgl.bind_element_buffer(new Uint16Array(cube.indices));




  const mat_projection = mat4.create();
  const FOV    = Math.PI / 4;
  const RATIO  = screen_width / screen_height;
  const Z_NEAR = 0.1;
  const Z_FAR  = 100.0;
  mat4.perspective(mat_projection, FOV, RATIO, Z_NEAR, Z_FAR);

  const mat_modelview = mat4.create();

  const Stack = WebGL.create_stack_mat4();


  const scene_rotation = [0, 0, 0];


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
      this.coordinates[0] = e.clientX - bounding_client_rect.x;
      this.coordinates[1] = e.clientY - bounding_client_rect.y;

      if (this.event) {
        const dx = e.clientX - this.event.clientX;
        const dy = e.clientY - this.event.clientY;
        scene_rotation[0] += +dy * 0.01;
        scene_rotation[1] += +dx * 0.01;
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

    // clear 2D scene
    ctx.save();
    ctx.clearRect(0, 0, screen_width, screen_height);
    ctx.lineWidth = 2;

    // fps
    const FPS = 1000 / elapsed | 0;
    ctx.font = '24px "Arial"';
    ctx.fillStyle = 'white';
    ctx.fillText(FPS, 30, 30);

    // push projection
    Stack.push(mat_projection);


    // sets camera
    mat4.translate(mat_projection, mat_projection, [0, 0, -10]);
    mat4.rotateX(mat_projection, mat_projection, scene_rotation[0]);
    mat4.rotateY(mat_projection, mat_projection, scene_rotation[1]);
    mat4.rotateZ(mat_projection, mat_projection, scene_rotation[2]);


    // clear 3D scene
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);




    // draw
    gl.uniformMatrix4fv(u_loc.view, false, mat4.multiply([], mat_projection, mat_modelview));
    gl.uniformMatrix4fv(u_loc.normal, false, mat4.transpose([], mat4.invert([], mat_modelview)));
    gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);


    // pop projection
    Stack.pop(mat_projection);


    // request redraw
    ctx.restore();
    requestAnimationFrame(render);
  }


  return {
    render,
  }
}
