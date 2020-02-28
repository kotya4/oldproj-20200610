
GL.Drawable = function(args) {
  
  const arg = Application.get_argument_parser('GL.Drawable', args);

  const vfirst = arg('vfirst', 0);
  const vcount = arg('vcount', 24);
  const texture = arg('texture', 'img/test.png');

  let vmat = mat4.create(); // modelview matrix
  let nmat = mat4.create(); // normal matrix
  let tmat = mat4.create(); // texture matrix
  let fmat = mat4.create(); // form matrix
  make_normal();

  function reset() {
    fmat = mat4.create();
    vmat = mat4.create();
    nmat = mat4.create();
    make_normal();
    return this;
  }

  function rotate(angle, ...a) {
    mat4.rotate(fmat, fmat, angle, a);
    make_normal();
    return this;
  }

  function translate(...a) {
    mat4.translate(vmat, vmat, a);
    make_normal();
    return this;
  }

  function scale(...a) {
    mat4.scale(fmat, fmat, a);
    make_normal();
    return this;
  }

  function make_normal() {
    mat4.invert(nmat, vmat);
    mat4.transpose(nmat, nmat);
  }


  this.translate = translate;
  this.rotate = rotate;
  this.scale = scale;
  this.reset = reset;

  this.vmat = vmat;
  this.nmat = nmat;
  this.tmat = tmat;
  this.fmat = fmat;

  this.vfirst = vfirst;
  this.vcount = vcount;
  this.texture = texture;
  this.color = [1.0, 1.0, 1.0, 1.0];
}