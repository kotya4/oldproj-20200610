
function GLScene({ args }) {

  /*
  const fov = arg('fov', 50);        // field of view in degrees
  const width = arg('width', 640);   // window width
  const height = arg('height', 320); // window height
  const ambient = arg('ambient');
  const vertex_shader = arg('vert');
  const fragment_shader = arg('frag');
  const vbos = arg('vbos');
  const images = arg('imgs');
  */

  // creates context 2d
  //const ctx = create_context_2d(width, height);
  // creates canvas and webgl context
  const gl = create_gl(300, 300);
  // creates shader program information wich contains program 
  // itself and all shader atribute pointers
  const program_information = create_program_information(
    create_program(
      create_shader(gl.VERTEX_SHADER, 
`

varying highp vec2 v_texcoord;
varying highp vec3 v_ambient;
varying highp vec4 v_fragment;

void main (void) {
  highp float light_distance = length(u_light.position - vec3(v_fragment));
  highp vec3 light = u_light.color / (1.0 + u_light.attenuation * light_distance);

  highp vec4 color = texture2D(u_texture, v_texcoord);
  gl_FragColor = vec4(color.rgb * (v_ambient + light), color.a);
}
`),
      create_shader(gl.FRAGMENT_SHADER, fragment_shader)
    )
  );
  // creates textures
  const textures = create_textures(images);
  // creates projection matrix
  let pmat = mat4.create();
  mat4.perspective(pmat, fov * Math.PI / 180, width / height, 0.1, 1000.0);
  // binds vbos
  bind_vbos(vbos);
  // updates ambient uniforms
  update_ambient_uniforms(ambient);

  /*
  function create_context_2d(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.zIndex = '1000';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    Application.debug.set_ctx(ctx); // sets debugger's context
    return ctx;
  }
  */

  function create_gl(width, height) {
    const canvas  = document.createElement('canvas');
    canvas.width  = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    const gl = canvas.getContext('webgl');
    if (gl === null) {
      throw new Error('webgl content not created');
      return null;
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // sets clear color
    gl.clearDepth(1.0);                // clear everything
    gl.enable(gl.DEPTH_TEST);          // enable depth testing
    gl.depthFunc(gl.LEQUAL);           // near things obscure far things
    //gl.enable(gl.BLEND);
    //gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    //gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    return gl;
  }

  function create_shader(type, data) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, data);
    gl.compileShader(shader);
    if (false === gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw(`GL.Scene.create_shader -> Error in ${type} occurred:\n${gl.getShaderInfoLog(shader)}`);
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function create_program(vs, fs) {
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
      throw(`GL.Scene.create_program -> Error in shader program:\n${gl.getProgramInfoLog(program)}`);
      gl.deleteProgram(program);
      return null;
    }
    gl.useProgram(program); // gl uses only one program so no need
                            // to call useProgram repeatedly
    return program;
  }

  function create_program_information(program) {
    return {
      a_position: gl.getAttribLocation (program, 'a_position'),
      a_texcoord: gl.getAttribLocation (program, 'a_texcoord'),
      a_normals:  gl.getAttribLocation (program, 'a_normal'),
      
      u_projection:  gl.getUniformLocation(program, 'u_projection'),
      u_modelview:  gl.getUniformLocation(program, 'u_modelview'),
      u_modelform:  gl.getUniformLocation(program, 'u_modelform'),
      u_textureform:  gl.getUniformLocation(program, 'u_textureform'),

      u_sampler:  gl.getUniformLocation(program, 'u_texture'),
      u_light:    {
        position: gl.getUniformLocation(program, 'u_light.position'),
        color:    gl.getUniformLocation(program, 'u_light.color'),
        attenuation: gl.getUniformLocation(program, 'u_light.attenuation'),
      },

      u_ambient: {
        color: gl.getUniformLocation(program, 'u_ambient.color'),
        directional_color: gl.getUniformLocation(program, 'u_ambient.directional_color'),
        directional_normal: gl.getUniformLocation(program, 'u_ambient.directional_normal'),
      },

      u_normal_matrix: gl.getUniformLocation(program, 'u_normal_matrix'),
    }
  }

  function bind_vbos(vbos) {
    const raw = JSON.parse(vbos);
    // positions vbo
    const position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(raw.positions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(program_information.a_position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program_information.a_position);
    // texture coordinates vbo
    const texcoord_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoord_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(raw.texcoords), gl.STATIC_DRAW);
    gl.vertexAttribPointer(program_information.a_texcoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program_information.a_texcoord);
    // normals
    const normals_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normals_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(raw.normals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(program_information.a_normals, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program_information.a_normals);
  }

  function create_texture(img) {
    const image = img;
    const gltex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, gltex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    if (0 === (img.width  & (img.width  - 1)) && 
        0 === (img.height & (img.height - 1))) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    return { image: image, gltexture: gltex };
  }

  function create_textures(imgs) {
    gl.activeTexture(gl.TEXTURE0);                  // sets active texture to 0
    gl.uniform1i(program_information.u_sampler, 0); // sets texture sampler to 0
    let textures = {};
    for (let name in imgs) {
      textures[name] = create_texture(imgs[name]);
    }
    return textures;
  }

  function get_texture(name) {
    if (name in textures) { return textures[name]; }
    else { throw (`GL.Scene.get_texture -> Texture '${name}' does not exist.`); }
  }

  function draw(drawable) {
    gl.uniformMatrix4fv(program_information.u_modelview, false, drawable.vmat);
    gl.uniformMatrix4fv(program_information.u_normal_matrix, false, drawable.nmat);
    gl.uniformMatrix4fv(program_information.u_modelform, false, drawable.fmat);
    gl.uniformMatrix4fv(program_information.u_textureform, false, drawable.tmat);

    gl.bindTexture(gl.TEXTURE_2D, get_texture(drawable.texture).gltexture);
    gl.drawArrays(gl.TRIANGLES, drawable.vfirst, drawable.vcount);
  }

  function reset_view() { // setup_draw
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);   // clears window
    gl.uniformMatrix4fv(program_information.u_projection, false, pmat); // sets projection matrix

    // TODO: this is light example. need to create array of those lights
    gl.uniform3fv(program_information.u_light.position, [-14.4, 2, -40]);
    gl.uniform3fv(program_information.u_light.color, [ 1.0, 0.0, 0.0 ]);
    gl.uniform1f(program_information.u_light.attenuation, 0.5);
  }

  function update_ambient_uniforms(ambient) {
    gl.uniform3fv(program_information.u_ambient.color, ambient.ambient_color);
    gl.uniform3fv(program_information.u_ambient.directional_color, ambient.directional_color);
    gl.uniform3fv(program_information.u_ambient.directional_normal, ambient.directional_normal);
  }

  function test() {
    reset_view();
    draw(new GLDrawable({}).translate(0, 0, -5).rotate(0.9, 1, 1, 0));
  }


  this.test = test;
  this.width = width;
  this.height = height;
  this.ctx = ctx;

  this.reset_view = reset_view;
  this.gl = gl;
  this.draw = draw;
  this.pmat = pmat;
  this.program_information = program_information;
  this.light_pos = [-14.4, 2, -40];
}