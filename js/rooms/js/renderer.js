//
function Renderer(g) {

  function arrpart(a, start, count) {
    return a.slice(start, start + count);
  }


  const { gl, ctx, webgl } = g;

  g.mouse.onmousemove = function (e) {
    if (this.buttons[0]) {
      if (this.dy < 0 && g.camera.pitch < +Math.PI / 2
      ||  this.dy > 0 && g.camera.pitch > -Math.PI / 2)
      {
        g.camera.pitch -= this.dy * 0.005;
      }
      g.camera.yaw -= this.dx * 0.005;
    }
  };









  // sheet
  // Cторона куба, использующаяся для создания стены.
  // Не изменяется сам, но изменяется в процессе создания стены.

  const VERTICES_LEN = 4;
  const INDICES_LEN = 6;

  const sheet = {
    texuv: [],
    coord: [],
    normal: [],
    tangent: [],
    indices: [],
  };

  // prepares sheet
  {
    for (let i = 0; i < VERTICES_LEN; ++i) {
      sheet.texuv.push(WebGLu.CUBE.texcoords[i * 2 + 0],
                       WebGLu.CUBE.texcoords[i * 2 + 1]);
      sheet.coord.push(WebGLu.CUBE.coordinates[i * 3 + 0],
                       WebGLu.CUBE.coordinates[i * 3 + 1],
                       0);
      sheet.normal.push(WebGLu.CUBE.normals[i * 3 + 0],
                        WebGLu.CUBE.normals[i * 3 + 1],
                        WebGLu.CUBE.normals[i * 3 + 2]);
      sheet.tangent.push(WebGLu.CUBE.tangents[i * 3 + 0],
                         WebGLu.CUBE.tangents[i * 3 + 1],
                         WebGLu.CUBE.tangents[i * 3 + 2]);
    }

    for (let i = 0; i < INDICES_LEN; ++i) {
      sheet.indices.push(WebGLu.CUBE.indices[i]);
    }
  }

  // room
  // Здесь заполняются данные для VAO.
  // Данные копируются из sheet изменяясь с помощью transformMat4.

  const texuv = [];
  const coord = [];
  const normal = [];
  const tangent = [];
  const indices = [];

  let walls_pushed = 0;

  function push_wall(mv, mr) {
    mv = mv || mat4.create(); // modelview
    mr = mr || mat4.create(); // rotation matrix

    const rv = mat4.multiply([], mr, mv);

    for (let vi = 0; vi < VERTICES_LEN; ++vi) {
      texuv.push(...vec2.transformMat4([], arrpart(sheet.texuv, vi * 2, 2), mv));
      coord.push(...vec3.transformMat4([], arrpart(sheet.coord, vi * 3, 3), rv));
      normal.push(...arrpart(sheet.normal, vi * 3, 3));
      tangent.push(...arrpart(sheet.tangent, vi * 3, 3));
      // TODO: нормали и тангенты вычисляются неправильно
    }

    indices.push(...sheet.indices.map(e => e + walls_pushed * 4));

    ++walls_pushed;
  }

  function create_vao() {
    const vao = webgl.bind_vao();
    webgl.bind_array_buffer(g.a_loc('a_texuv'), new Float32Array(texuv), 2, gl.FLOAT);
    webgl.bind_array_buffer(g.a_loc('a_coord'), new Float32Array(coord), 3, gl.FLOAT);
    webgl.bind_array_buffer(g.a_loc('a_normal'), new Float32Array(normal), 3, gl.FLOAT);
    webgl.bind_array_buffer(g.a_loc('a_tangent'), new Float32Array(tangent), 3, gl.FLOAT);
    webgl.bind_element_buffer(new Uint16Array(indices));
    return vao;
  }

  function render_vao(vao, modelview) {
    gl.bindVertexArray(vao);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, g.textures('cat'));
    gl.uniform1i(g.u_loc('u_texture'), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, webgl.EMPTY_NORMALMAP);
    gl.uniform1i(g.u_loc('u_normalmap'), 1);

    modelview = modelview || mat4.create();
    const normalmatrix = mat3.transpose([], mat3.invert([], WebGLu.to_mat3([], modelview)));

    gl.uniformMatrix4fv(g.u_loc('u_modelview'), false, modelview);
    gl.uniformMatrix4fv(g.u_loc('u_projection'), false, g.projection);
    gl.uniformMatrix3fv(g.u_loc('u_normalmatrix'), false, normalmatrix);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }






  const walls = [
    [ 0, 0,  3, 0],
    [ 3, 0,  3, 5],
    [ 3, 5,  0, 5],
    [ 0, 5,  0, 0],
  ];



  walls.forEach((w,i) => {
    const dx = Math.abs(w[2] - w[0]);
    const dy = Math.abs(w[3] - w[1]);
    const scaler = dx || dy;
    const rotate = Math.abs(dx) < Math.abs(dy);
    let tx = Math.min(w[0], w[2]);
    let ty = Math.min(w[1], w[3]);
    if (rotate) [tx, ty] = [ty, -tx];

    const mv = mat4.create();
    mat4.translate(mv, mv, [tx, 0, ty]);
    mat4.scale(mv, mv, [scaler, 1, 1]);

    const mr = mat4.create();
    if (rotate) mat4.rotateY(mr, mr, -Math.PI / 2 * Math.sign(dy));

    push_wall(mv, mr);
  });



  const vao = create_vao();


  const modelview = mat4.translate([], mat4.create(), [0, 0, 0]);

  // render
  g.render = function(timestamp, elapsed) {

    // g.render_cube(modelview);

    // WebGLu.draw_btn(
    //   ctx, webgl.viewport, g.projection,
    //   { coordinates: coord, normals: normal, tangents: tangent, bitangents: null, indices: indices },
    // );

    render_vao(vao, modelview);


  };






}
