if (!vec3) var vec3 = glMatrix.vec3;
if (!vec4) var vec4 = glMatrix.vec4;
if (!mat3) var mat3 = glMatrix.mat3;
if (!mat4) var mat4 = glMatrix.mat4;


// WebGL Utils
function WebGLu() {

}


// creates cube
WebGLu.cube = function () {
  const coordinates = [
    0, 0, 1,    1, 0, 1,    1, 1, 1,    0, 1, 1, // Front
    0, 0, 0,    0, 1, 0,    1, 1, 0,    1, 0, 0, // Back
    0, 1, 0,    0, 1, 1,    1, 1, 1,    1, 1, 0, // Top
    0, 0, 0,    1, 0, 0,    1, 0, 1,    0, 0, 1, // Bottom
    1, 0, 0,    1, 1, 0,    1, 1, 1,    1, 0, 1, // Right
    0, 0, 0,    0, 0, 1,    0, 1, 1,    0, 1, 0, // Left
  ];
  const normals = [
     0,  0, +1,    0,  0, +1,    0,  0, +1,    0,  0, +1, // Front
     0,  0, -1,    0,  0, -1,    0,  0, -1,    0,  0, -1, // Back
     0, +1,  0,    0, +1,  0,    0, +1,  0,    0, +1,  0, // Top
     0, -1,  0,    0, -1,  0,    0, -1,  0,    0, -1,  0, // Bottom
    +1,  0,  0,   +1,  0,  0,   +1,  0,  0,   +1,  0,  0, // Right
    -1,  0,  0,   -1,  0,  0,   -1,  0,  0,   -1,  0,  0, // Left
  ];
  const colors = [
    1, 0, 0, 1,  1, 0, 0, 1,  1, 0, 0, 1,  1, 0, 0, 1, // Front (red)
    0, 1, 0, 1,  0, 1, 0, 1,  0, 1, 0, 1,  0, 1, 0, 1, // Back (green)
    1, 0, 1, 1,  1, 0, 1, 1,  1, 0, 1, 1,  1, 0, 1, 1, // Top (magenta)
    0, 1, 1, 1,  0, 1, 1, 1,  0, 1, 1, 1,  0, 1, 1, 1, // Bottom (cyan)
    0, 0, 1, 1,  0, 0, 1, 1,  0, 0, 1, 1,  0, 0, 1, 1, // Right (blue)
    1, 1, 0, 1,  1, 1, 0, 1,  1, 1, 0, 1,  1, 1, 0, 1, // Left (yellow)
  ];
  const texcoords = [
    0, 1,   1, 1,   1, 0,   0, 0, // Front
    1, 1,   1, 0,   0, 0,   0, 1, // Back
    0, 0,   0, 1,   1, 1,   1, 0, // Top
    0, 1,   1, 1,   1, 0,   0, 0, // Bottom
    1, 1,   1, 0,   0, 0,   0, 1, // Right
    0, 1,   1, 1,   1, 0,   0, 0, // Left
  ];
  const indices = [
     0,  1,  2,    2,  3,  0, // Front
     4,  5,  6,    6,  7,  4, // Back
     8,  9, 10,   10, 11,  8, // Top
    12, 13, 14,   14, 15, 12, // Bottom
    16, 17, 18,   18, 19, 16, // Right
    20, 21, 22,   22, 23, 20, // Left
  ];
  const tangents = [
    +1,  0,  0,    +1,  0,  0,    +1,  0,  0,    +1,  0,  0, // Front
    -1,  0,  0,    -1,  0,  0,    -1,  0,  0,    -1,  0,  0, // Back
    +1,  0,  0,    +1,  0,  0,    +1,  0,  0,    +1,  0,  0, // Top
    +1,  0,  0,    +1,  0,  0,    +1,  0,  0,    +1,  0,  0, // Bottom
     0,  0, -1,     0,  0, -1,     0,  0, -1,     0,  0, -1, // Right
     0,  0, +1,     0,  0, +1,     0,  0, +1,     0,  0, +1, // Left
  ];
  return {
    coordinates,
    texcoords,
    tangents,
    normals,
    indices,
    colors,
  };
}


// creates matrices stack
WebGLu.stack_mat4 = function () {
  return {
    stack: [],
    pop(m) { mat4.copy(m, this.stack.pop()); },
    push(m) { this.stack.push(mat4.clone(m)); },
  };
}


// projects 3D point into 2D screen space
WebGLu.project = function (out, v, viewport, m) {
  const view_x = viewport[0];
  const view_y = viewport[1];
  const view_w = viewport[2];
  const view_h = viewport[3];

  const [x, y, z] = vec3.transformMat4([], v, m);

  if (z > 0 && z < 1 && z > 0 && z < 1) {
    out[0] = (x / +z + 1) * (view_w >> 1) + view_x;
    out[1] = (y / -z + 1) * (view_h >> 1) + view_y;
    out[2] = z;
  }

  return out;
}


 // unprojects 2D point in screen space into 3D space
WebGLu.unproject = function (out, v, viewport, m) {
  // source: https://github.com/Jam3/camera-unproject
  const view_x = viewport[0];
  const view_y = viewport[1];
  const view_w = viewport[2];
  const view_h = viewport[3];

  // Normalized Device Coordinates (NDC)
  const nx = 2 * (         v[0] - view_x    ) / view_w - 1;
  const ny = 2 * (view_h - v[1] - view_y - 1) / view_h - 1;
  const nz = 2 * (         v[2] || 0        )          - 1; // v[2]=0 means "near plane"

  m = mat4.invert([], m);
  const [x, y, z, w] = vec4.transformMat4([], [nx, ny, nz, 1], m);

  out[0] = x / w;
  out[1] = y / w;
  out[2] = z / w;

  return out;
}


// creates face normal
WebGLu.face_normal = function (x1, y1, z1, x2, y2, z2, x3, y3, z3) {
  // source: https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal
  //       p2
  //  _   ^  \
  //  U  /    \
  //    /      \
  //   /        \
  //  p1------->p3
  //       _
  //       V
  const Ux = x2 - x1;
  const Uy = y2 - y1;
  const Uz = z2 - z1;
  const Vx = x3 - x1;
  const Vy = y3 - y1;
  const Vz = z3 - z1;
  const Nx = Uy * Vz - Uz * Vy;
  const Ny = Uz * Vx - Ux * Vz;
  const Nz = Ux * Vy - Uy * Vx;
  // normalize
  const Nmag = Math.sqrt(Nx * Nx + Ny * Ny + Nz * Nz);
  return [Nx / Nmag, Ny / Nmag, Nz / Nmag];
}


// creates tangents and bitangents
WebGLu.tangents = function (tangents, bitangents, { coordinates, texcoords, indices }) {
  // source: https://habr.com/ru/post/415579/
  // related: https://community.khronos.org/t/how-to-calculate-tbn-matrix/64002

  tangents = tangents || [];
  bitangents = bitangents || [];

  for (let indices_index = 0; indices_index < indices.length; ) {
    const _indices = [
      indices[indices_index++],
      indices[indices_index++],
      indices[indices_index++],
    ];

    const _coordinates = _indices.map(i => [
      coordinates[i * 3 + 0],
      coordinates[i * 3 + 1],
      coordinates[i * 3 + 2],
    ]);

    const _texcoords = _indices.map(i => [
      texcoords[i * 2 + 0],
      texcoords[i * 2 + 1],
    ]);

    const edge1 = Array(3).fill().map((_, i) => _coordinates[1][i] - _coordinates[0][i]); // pos2 - pos1;
    const edge2 = Array(3).fill().map((_, i) => _coordinates[2][i] - _coordinates[0][i]); // pos3 - pos1;
    const dUV1  = Array(2).fill().map((_, i) => _texcoords[1][i] - _texcoords[0][i]); // uv2 - uv1;
    const dUV2  = Array(2).fill().map((_, i) => _texcoords[2][i] - _texcoords[0][i]); // uv3 - uv1;
    const f = 1.0 / (dUV1[0] * dUV2[1] - dUV2[0] * dUV1[1]);

    const tangent = [
      f * (dUV2[1] * edge1[0] - dUV1[1] * edge2[0]),
      f * (dUV2[1] * edge1[1] - dUV1[1] * edge2[1]),
      f * (dUV2[1] * edge1[2] - dUV1[1] * edge2[2]),
    ];
    const tmag = Math.hypot(...tangent);
    tangents.push(...tangent.map(e => e / tmag));

    const bitangent = [
      f * (-dUV2[0] * edge1[0] + dUV1[0] * edge2[0]),
      f * (-dUV2[0] * edge1[1] + dUV1[0] * edge2[1]),
      f * (-dUV2[0] * edge1[2] + dUV1[0] * edge2[2]),
    ];
    const bmag = Math.hypot(...bitangent);
    bitangents.push(...bitangent.map(e => e / bmag));
  }

  return {
    tangents,
    bitangents,
  };
}


// draws btn
WebGLu.draw_btn = function (
  ctx, viewport, matrix,
  { coordinates, normals, tangents, bitangents, indices },
  indices_start, indices_number, scaler)
{
  indices_start  = indices_start  || 0;
  indices_number = indices_number || (indices.length - indices_start);
  scaler         = scaler         || 0.1;
  for (let i = indices_start; i < indices_start + indices_number; ++i) {
    const ii = indices[i];
    const p1 = [
      coordinates[ii * 3 + 0],
      coordinates[ii * 3 + 1],
      coordinates[ii * 3 + 2],
    ];
    const p2 = normals ? [
      normals[ii * 3 + 0] * scaler + p1[0],
      normals[ii * 3 + 1] * scaler + p1[1],
      normals[ii * 3 + 2] * scaler + p1[2],
    ] : p1;
    const p3 = tangents ? [
      tangents[ii * 3 + 0] * scaler + p1[0],
      tangents[ii * 3 + 1] * scaler + p1[1],
      tangents[ii * 3 + 2] * scaler + p1[2],
    ] : p1;
    const p4 = bitangents ? [
      bitangents[ii * 3 + 0] * scaler + p1[0],
      bitangents[ii * 3 + 1] * scaler + p1[1],
      bitangents[ii * 3 + 2] * scaler + p1[2],
    ] : p1;
    const v1 = [], v2 = [], v3 = [], v4 = [];
    WebGLu.project(v1, p1, viewport, matrix);
    WebGLu.project(v2, p2, viewport, matrix);
    WebGLu.project(v3, p3, viewport, matrix);
    WebGLu.project(v4, p4, viewport, matrix);
    // normal
    if (v1 && v2) {
      ctx.fillStyle = ctx.strokeStyle = 'blue';
      ctx.beginPath();
      ctx.moveTo(v1[0], v1[1]);
      ctx.lineTo(v2[0], v2[1]);
      ctx.stroke();
    }
    // tangent
    if (v1 && v3) {
      ctx.fillStyle = ctx.strokeStyle = 'red';
      ctx.beginPath();
      ctx.moveTo(v1[0], v1[1]);
      ctx.lineTo(v3[0], v3[1]);
      ctx.stroke();
    }
    // bitangent
    if (v1 && v4) {
      ctx.fillStyle = ctx.strokeStyle = 'green';
      ctx.beginPath();
      ctx.moveTo(v1[0], v1[1]);
      ctx.lineTo(v4[0], v4[1]);
      ctx.stroke();
    }
  }
}


// draws axis
WebGLu.draw_axis = function (ctx, viewport, matrix) {
  const v1 = [], v2 = [];
  WebGLu.project(v1, [0, 0, 0], viewport, matrix);
  // x
  WebGLu.project(v2, [-1, 0, 0], viewport, matrix); // inversed?
  ctx.strokeStyle = ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.moveTo(v1[0], v1[1]);
  ctx.lineTo(v2[0], v2[1]);
  ctx.stroke();
  ctx.fillText('X', v2[0], v2[1]);
  // y
  WebGLu.project(v2, [0, 1, 0], viewport, matrix);
  ctx.strokeStyle = ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.moveTo(v1[0], v1[1]);
  ctx.lineTo(v2[0], v2[1]);
  ctx.stroke();
  ctx.fillText('Y', v2[0], v2[1]);
  // z
  WebGLu.project(v2, [0, 0, 1], viewport, matrix);
  ctx.strokeStyle = ctx.fillStyle = 'blue';
  ctx.beginPath();
  ctx.moveTo(v1[0], v1[1]);
  ctx.lineTo(v2[0], v2[1]);
  ctx.stroke();
  ctx.fillText('Z', v2[0], v2[1]);
}


// creates safe accessor
WebGLu.accessor = function (o) {
  function accessor(key) {
    if (key in o) return o[key];
    throw Error(`accessor:: key '${key}' does not exist`);
  }
  accessor._self_ = o;
  return accessor;
}


// cvt_mat4_to_mat3
WebGLu.cvt_mat4_to_mat3 = function (out, m4) {
  out = [
    m4[ 0], m4[ 1], m4[ 2],
    m4[ 4], m4[ 5], m4[ 6],
    m4[ 8], m4[ 9], m4[10],
  ];
  return out;
}


// creates fps camera
WebGLu.camera = function (opt) {
  opt = opt || {};
  opt.position = opt.position || [-0.94, +1.43, -0.83];
  opt.pitch = opt.pitch || 0.12;
  opt.roll = opt.roll || 0.00;
  opt.yaw = opt.yaw || 0.84;
  return {
    d_forward: 0,
    d_strafe: 0,
    d_up: 0,
    forward: [],
    strafe: [],
    up: [],
    center: [],
    mat_view: mat4.create(),
    apply(m) {
      // source: http://www.opengl-tutorial.org/beginners-tutorials/tutorial-6-keyboard-and-mouse/
      this.forward[0] = Math.cos(this.pitch) * Math.sin(this.yaw);
      this.forward[1] = Math.sin(this.pitch);
      this.forward[2] = Math.cos(this.pitch) * Math.cos(this.yaw);
      this.strafe[0] = Math.sin(this.yaw - Math.PI / 2);
      this.strafe[1] = 0;
      this.strafe[2] = Math.cos(this.yaw - Math.PI / 2);
      vec3.cross(this.up, this.strafe, this.forward);
      vec3.scaleAndAdd(this.position, this.position, this.forward, this.d_forward);
      vec3.scaleAndAdd(this.position, this.position, this.strafe, this.d_strafe);
      vec3.scaleAndAdd(this.position, this.position, this.up, this.d_up);
      this.d_forward = this.d_strafe = this.d_up = 0;
      vec3.add(this.center, this.position, this.forward);
      mat4.lookAt(this.mat_view, this.position, this.center, this.up);
      mat4.multiply(m, m, this.mat_view);
      return m;
    },
    ...opt,
  };
}


// creates keyboard
WebGLu.keyboard = function (opt) {
  const keyboard = {
    keys: [],
    onkeydown(e) {
    },
    onkeyup(e) {
    },
    _onkeydown(e) {
      this.keys[e.code] = true;
      this.onkeydown(e);
    },
    _onkeyup(e) {
      this.keys[e.code] = false;
      this.onkeyup(e);
    },
    ...opt,
  };
  window.addEventListener('keydown', e => keyboard._onkeydown(e));
  window.addEventListener('keyup', e => keyboard._onkeyup(e));
  return keyboard;
}


// creates mouse
WebGLu.mouse = function (opt) {
  const mouse = {
    buttons: [],
    delta: null,
    x: null,
    y: null,
    onmousemove(e) {},
    onmousedown(e) {},
    onmouseup(e) {},
    onweel(e) {},
    _onmousemove(e) {
      this.x = e.x;
      this.y = e.y;
      this.onmousemove(e);
    },
    _onmousedown(e) {
      this.buttons[e.button] = true;
      this.x = e.x;
      this.y = e.y;
      this.onmousedown(e);
    },
    _onmouseup(e) {
      this.buttons[e.button] = false;
      this.x = e.x;
      this.y = e.y;
      this.onmouseup(e);
    },
    _onweel(e) {
      this.delta = e.deltaY;
      this.onweel(e);
    },
    ...opt,
  };
  window.addEventListener('mousedown', e => mouse._onmousedown(e));
  window.addEventListener('mousemove', e => mouse._onmousemove(e));
  window.addEventListener('mouseup', e => mouse._onmouseup(e));
  window.addEventListener('wheel', e => mouse._onweel(e));
  return mouse;
}
