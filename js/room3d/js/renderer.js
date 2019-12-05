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
  const sheet = {
    texuv: [],
    coord: [],
    normal: [],
    tangent: [],
    indices: [],
  };
  for (let i = 0; i < 4; ++i) {
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
  for (let i = 0; i < 6; ++i) {
    sheet.indices.push(WebGLu.CUBE.indices[i]);
  }

  // room

  const texuv = [];
  const coord = [];
  const normal = [];
  const tangent = [];
  const indices = [];

  const modelview = mat4.create();
  mat4.scale(modelview, modelview, [1, 2, 1]);
  mat4.translate(modelview, modelview, [0, 0, 0]);

  for (let vi = 0; vi < 4; ++vi) {

    coord.push(...vec3.transformMat4([], arrpart(sheet.coord, vi * 3, 3), modelview));
    texuv.push(...vec2.transformMat4([], arrpart(sheet.texuv, vi * 2, 2), modelview));
    normal.push(...arrpart(sheet.normal, vi * 3, 3));
    tangent.push(...arrpart(sheet.tangent, vi * 3, 3));
  }

  indices.push(...sheet.indices);



  const room_vao = webgl.bind_vao();
  webgl.bind_array_buffer(g.a_loc('a_texuv'), new Float32Array(texuv), 2, gl.FLOAT);
  webgl.bind_array_buffer(g.a_loc('a_coord'), new Float32Array(coord), 3, gl.FLOAT);
  webgl.bind_array_buffer(g.a_loc('a_normal'), new Float32Array(normal), 3, gl.FLOAT);
  webgl.bind_array_buffer(g.a_loc('a_tangent'), new Float32Array(tangent), 3, gl.FLOAT);
  webgl.bind_element_buffer(new Uint16Array(indices));

  function render_room(modelview) {
    gl.bindVertexArray(room_vao);

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



  //WebGLu.CUBE.coordinates;



  g.render = function(timestamp, elapsed) {


    // g.render_cube(modelview);

    render_room(mat4.translate([], mat4.create(), [0, 0, 0]));

  };






}
