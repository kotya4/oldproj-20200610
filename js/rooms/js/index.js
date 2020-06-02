
window.onload = function() {

  // Init.

  const g = Graphics(500, 500);
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

  // Generates room.

  const rg = RoomGenerator({ space: 20, rsize: 3 }, Math.random); // new Math.seedrandom(7425));

  // Creates VAO out of it.

  const vao = create_vao(rg.vaodata);

  // Modelview.

  const modelview = mat4.translate([], mat4.create(), [0, 0, 0]);

  // RENDER.

  g.render = function(timestamp, elapsed) {

    render_vao(vao, modelview, rg.vaodata.indices);

  };


  ///////////////////////////////////////////////////////////////


  function create_vao(vaodata) {
    const vao = webgl.bind_vao();
    webgl.bind_array_buffer(g.a_loc('a_texuv'),   new Float32Array(vaodata.texcoords),   2, gl.FLOAT);
    webgl.bind_array_buffer(g.a_loc('a_coord'),   new Float32Array(vaodata.coordinates), 3, gl.FLOAT);
    webgl.bind_array_buffer(g.a_loc('a_normal'),  new Float32Array(vaodata.normals),     3, gl.FLOAT);
    webgl.bind_array_buffer(g.a_loc('a_tangent'), new Float32Array(vaodata.tangents),    3, gl.FLOAT);
    webgl.bind_element_buffer(new Uint16Array(vaodata.indices));
    return vao;
  }


  function render_vao(vao, modelview, indices) {
    gl.bindVertexArray(vao);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, g.textures('wall'));
    gl.uniform1i(g.u_loc('u_texture'), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, g.textures('normal'));
    gl.uniform1i(g.u_loc('u_normalmap'), 1);

    modelview = modelview || mat4.create();
    const normalmatrix = mat3.transpose([], mat3.invert([], WebGLu.to_mat3([], modelview)));

    gl.uniformMatrix4fv(g.u_loc('u_modelview'), false, modelview);
    gl.uniformMatrix4fv(g.u_loc('u_projection'), false, g.projection);
    gl.uniformMatrix3fv(g.u_loc('u_normalmatrix'), false, normalmatrix);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }
}
