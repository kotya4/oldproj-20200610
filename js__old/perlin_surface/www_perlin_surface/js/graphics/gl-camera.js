
GL.Camera = function(proj, move_speed, rot_speed, pos, angle) {

  

  this.move_x = function(e) {
    mat4.copy(this.pmatrix, this.pmatrix_native);
    mat4.translate(this.t, this.t, [-this.ms * e * Math.sin(this.a), 0, this.ms * e * Math.cos(this.a)]);
    mat4.multiply(this.pmatrix, this.pmatrix, this.t);
    this.pos[0] -= this.ms * e * Math.sin(this.a);
    this.pos[2] += this.ms * e * Math.cos(this.a);
  }

  this.move_y = function(e) {
    mat4.copy(this.pmatrix, this.pmatrix_native);
    mat4.translate(this.t, this.t, [0, this.ms * e, 0]);
    mat4.multiply(this.pmatrix, this.pmatrix, this.t);
    this.pos[1] += this.ms * e;
  }

  this.move_z = function(e) {
    mat4.copy(this.pmatrix, this.pmatrix_native);
    mat4.translate(this.t, this.t, [this.ms * e * Math.cos(this.a), 0, this.ms * e * Math.sin(this.a)]);
    mat4.multiply(this.pmatrix, this.pmatrix, this.t);
    this.pos[0] += this.ms * e * Math.cos(this.a);
    this.pos[2] += this.ms * e * Math.sin(this.a);
  }

  this.rotate = function(e) {
    mat4.rotate(this.pmatrix_native, this.pmatrix_native, this.rs * e, [0, 1, 0]);
    mat4.multiply(this.pmatrix, this.pmatrix_native, this.t);
    this.a += this.rs * e;
    if (this.a > Math.PI * 2) this.a = this.a - Math.PI * 2;
    else if (this.a < 0) this.a = Math.PI * 2 + this.a;
  }


  if (undefined === pos) pos = [0,0,0];
  if (undefined === angle) angle = 0;
  this.pos = pos;
  this.a = 0; // rotation angle
  this.t = mat4.create(); // translation
  mat4.translate(this.t, this.t, pos);
  this.r = mat4.create(); // rotation
  this.pmatrix = proj; // projection matrix
  this.pmatrix_native = mat4.create(); // native pm
  mat4.copy(this.pmatrix_native, this.pmatrix);
  this.ms = move_speed;
  this.rs = rot_speed / 10;
  //this.move_x(0);
  this.rotate(angle / this.rs);
}