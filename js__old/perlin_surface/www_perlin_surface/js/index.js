
function onload() {
  //const rand = Randomizer.xorshift128plus(13);
  

  const grad3 = [
    [+1,+1,+0], [-1,+1,+0], [+1,-1,+0], [-1,-1,+0],
    [+1,+0,+1], [-1,+0,+1], [+1,+0,-1], [-1,+0,-1],
    [+0,+1,+1], [+0,-1,+1], [+0,+1,-1], [+0,-1,-1]
  ];

  const perm = [
    151,160,137,91,90,15,
    131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
    190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
    88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
    77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
    102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
    135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
    223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
    129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
    251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
    49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
  ];

  // To remove the need for index wrapping, double the permutation table length
  //const perm = [...Array(256)].map((e,i) => p[i & 255]);
  //console.log(perm);


  function mix(a, b, t) {
    return (1 - t) * a + t * b;
  }

  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function noise(x, y, z) {
    // Find unit grid cell containing point
    let X = Math.floor(x);
    let Y = Math.floor(y);
    let Z = Math.floor(z);

    // Get relative xyz coordinates of point within that cell
    x = x - X;
    y = y - Y;
    z = z - Z;

    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255;
    Y = Y & 255;
    Z = Z & 255;

    // Calculate a set of eight hashed gradient indices
    //const pln = p.length;
    const dim = 12; //grad3.length;
    // The gradients of each corner
    let gi000 = perm[(X + 0 + perm[(Y + 0 + perm[(Z + 0) & 255]) & 255]) & 255] % dim;
    let gi001 = perm[(X + 0 + perm[(Y + 0 + perm[(Z + 1) & 255]) & 255]) & 255] % dim;
    let gi010 = perm[(X + 0 + perm[(Y + 1 + perm[(Z + 0) & 255]) & 255]) & 255] % dim;
    let gi011 = perm[(X + 0 + perm[(Y + 1 + perm[(Z + 1) & 255]) & 255]) & 255] % dim;
    let gi100 = perm[(X + 1 + perm[(Y + 0 + perm[(Z + 0) & 255]) & 255]) & 255] % dim;
    let gi101 = perm[(X + 1 + perm[(Y + 0 + perm[(Z + 1) & 255]) & 255]) & 255] % dim;
    let gi110 = perm[(X + 1 + perm[(Y + 1 + perm[(Z + 0) & 255]) & 255]) & 255] % dim;
    let gi111 = perm[(X + 1 + perm[(Y + 1 + perm[(Z + 1) & 255]) & 255]) & 255] % dim;

    function dot(g, x, y, z) {
      return g[0] * x + g[1] * y + g[2] * z;
      
    }

    /*
    for (let i = 0; i < 8; ++i) {
      let n = i.toString(2);
      n = [...Array(3 - n.length)].map(e => '0').join('') + n;
      eval('console.log(grad3[gi' + n + '])');
    }
    throw new Error();
    */

    // Calculate noise contributions from each of the eight corners
    let n000 = dot(grad3[gi000], x - 0, y - 0, z - 0);
    let n001 = dot(grad3[gi001], x - 0, y - 0, z - 1);
    let n010 = dot(grad3[gi010], x - 0, y - 1, z - 0);
    let n011 = dot(grad3[gi011], x - 0, y - 1, z - 1);
    let n100 = dot(grad3[gi100], x - 1, y - 0, z - 0);
    let n101 = dot(grad3[gi101], x - 1, y - 0, z - 1);
    let n110 = dot(grad3[gi110], x - 1, y - 1, z - 0);
    let n111 = dot(grad3[gi111], x - 1, y - 1, z - 1);
    
    // Compute the fade curve value for each of x, y, z
    let u = fade(x);
    let v = fade(y);
    let w = fade(z);
    
    // Interpolate along x the contributions from each of the corners
    let nx00 = mix(n000, n100, u);
    let nx01 = mix(n001, n101, u);
    let nx10 = mix(n010, n110, u);
    let nx11 = mix(n011, n111, u);
    


    // Interpolate the four results along y
    let nxy0 = mix(nx00, nx10, v);
    let nxy1 = mix(nx01, nx11, v);
    /*
    console.log(nx00);
    console.log(nx01);
    console.log(nx10);
    console.log(nx11);
    console.log(nxy0);
    console.log(nxy1);
    throw new Error();
    */
    // Interpolate the two last results along z
    let nxyz = mix(nxy0, nxy1, w);

    return nxyz;
  }

  
  /*
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'lightgrey';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  let x1 = 0;
  let y1 = 0;
  let z1 = 0;
  let xx = 250;
  const iid = setInterval(() => {
    //xx += 1;
    x1 -= 10;
    //y1 += 1;
    //z1 += 0.1;
    for (let x = 0; x < 50; ++x) {
      for (let y = 0; y < 50; ++y) {
        const c = noise((x + x1) / xx, (y + y1) / xx, z1 / xx) * 250;
        ctx.fillStyle = `rgb(${c},${c},${c})`;
        ctx.fillRect(x * 1, y * 1, 1, 1);
      }
    }

    ctx.fillStyle = 'grey';
    ctx.fillRect(380, 190, 50, 50);
    ctx.fillStyle = 'black';
    ctx.fillText(xx, 400, 200);

  }, 100);
  
  return;
  */


  /*
  ctx.fillStyle = 'white';
  const s = 256;
  for (let i = 0; i < 1; i += 1 / s) {
    ctx.fillRect(i * s, fade(i), 1, 1);
  }
  */


  function matmul(a, b) {
    const m = [...Array(a.length)]
      .map(e => [...Array(b[0].length)]
        .map(e => 0));
    for (let r = 0; r < a.length; ++r)
      for (let c = 0; c < b[0].length; ++c)
        for (let i = 0; i < a[0].length; ++i)
          m[r][c] += a[r][i] * b[i][c];
    return m;
  }

  function toFloat32Array(m) {
    const a = new Float32Array(m.length * m[0].length);
    for (let y = 0; y < m.length; ++y)
      for (let x = 0; x < m[0].length; ++x)
        a[x + y * m[0].length] = m[y][x];
    return a;
  }


  

  /*======= Creating a canvas =========*/

  const canvas = Object.assign(document.createElement('canvas'), {
    width: 400,
    height: 400
  });
  document.body.appendChild(canvas);
  const gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});


  /*=================== Shaders ====================*/

  const vertex_shader_raw = `
attribute vec3 a_position;
uniform mat4 u_transform;
void main(void) {
  gl_Position = u_transform * vec4(a_position, 1.0);
}`;
  const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertex_shader, vertex_shader_raw);
  gl.compileShader(vertex_shader);

  const fragment_shader_raw = `
void main(void) {
  gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);
}`;
  const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragment_shader, fragment_shader_raw);
  gl.compileShader(fragment_shader);
  
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertex_shader);
  gl.attachShader(shaderProgram, fragment_shader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  // Bind vertex buffer object
  const vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  const a_position = gl.getAttribLocation(shaderProgram, 'a_position');
  const u_transform = gl.getUniformLocation(shaderProgram, 'u_transform');
  gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_position);



  const fov = 45 * Math.PI / 180;
  const pm11 = 1 / Math.tan(fov / 2);
  const pm00 = canvas.height / canvas.width * pm11;
  const zfar = 100;
  const znear = 0.1;
  const pm22 = zfar / (zfar - znear);
  const pm32 = pm22 * (-znear);
  
  const projection = [
    [pm00, 0, 0, 0],
    [0, pm11, 0, 0],
    [0, 0, pm22, 1],
    [0, 0, pm32, 0],
  ];

  let rotx = 85 * Math.PI / 180;
  const sinx = Math.sin(rotx);
  const cosx = Math.cos(rotx);

  const rotationX = [
    [1, 0, 0, 0],
    [0, +cosx, +sinx, 0],
    [0, -sinx, +cosx, 0],
    [0, 0, 0, 1],
  ];
  
  const rotationY = [
    [+cosx, 0, +sinx, 0],
    [0, 1, 0, 0],
    [-sinx, 0, +cosx, 0],
    [0, 0, 0, 1],
  ];

  const translation = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, -0.25, 1.4, 1],
  ];

  let matrix = [
    [1,0,0,0],
    [0,1,0,0],
    [0,0,1,0],
    [0,0,0,1]
  ];
  
  matrix = matmul(matrix, rotationX);
  //matrix = matmul(matrix, rotationY);
  matrix = matmul(matrix, translation);
  matrix = matmul(matrix, projection);
  matrix = toFloat32Array(matrix);  

  gl.uniformMatrix4fv(u_transform, false, matrix);
  


  /*============ Drawing the triangle =============*/
  
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  //gl.clearColor(0.5, 0.5, 0.5, 0.9);
  gl.enable(gl.DEPTH_TEST);
  gl.viewport(0,0, canvas.width, canvas.height);


  /*
  // LINE_STRIP qube
  const vertices = new Float32Array([
    -1, -1, -1,
    -1, +1, -1,
    +1, +1, -1,
    +1, -1, -1,
    -1, -1, -1,
    -1, -1, +1,
    +1, -1, +1,
    +1, -1, -1,
    +1, +1, -1,
    +1, +1, +1,
    +1, -1, +1,
    -1, -1, +1,
    -1, +1, +1,
    +1, +1, +1,
    -1, +1, +1,
    -1, +1, -1,
  ]);
  */

  

  const grid = {
    width: 50,
    height: 50
  };

  const vertices = new Float32Array(grid.width * grid.height * 3 * 6 + grid.width * 3 * 2);
  
  const factor = 0.15;
  const size = 0.05;
  let offsetx = 0;
  let offsety = 0;
  let offsetz = 0;
  setInterval(() => {
    //offsetx += 0.1;
    //offsety -= 0.3;
    //offsetz += 0.01;
    let i = 0;
    for (let y = 0; y < grid.height; ++y) {
      for (let x = 0; x < grid.width + 1; ++x) {
        const pos = [
          (-1 + (x + 0) / grid.width * 2),
          (+1 - (y + 0) / grid.height * 2),
          noise((x + 0 + offsetx) * factor, (y + 0 + offsety) * factor, offsetz) * size,

          (-1 + (x + 0) / grid.width * 2),
          (+1 - (y + 1) / grid.height * 2),
          noise((x + 0 + offsetx) * factor, (y + 1 + offsety) * factor, offsetz) * size,

          (-1 + (x + 1) / grid.width * 2),
          (+1 - (y + 0) / grid.height * 2),
          noise((x + 1 + offsetx) * factor, (y + 0 + offsety) * factor, offsetz) * size,
        ];
        vertices[i + 0] = pos[0];
        vertices[i + 1] = pos[1];
        vertices[i + 2] = pos[2];
        i += 3;
        vertices[i + 0] = pos[3];
        vertices[i + 1] = pos[4];
        vertices[i + 2] = pos[5];
        i += 3;
        if (x === grid.width) continue;
        vertices[i + 0] = pos[3];
        vertices[i + 1] = pos[4];
        vertices[i + 2] = pos[5];
        i += 3;
        vertices[i + 0] = pos[6];
        vertices[i + 1] = pos[7];
        vertices[i + 2] = pos[8];
        i += 3;
        vertices[i + 0] = pos[6];
        vertices[i + 1] = pos[7];
        vertices[i + 2] = pos[8];
        i += 3;
        vertices[i + 0] = pos[0];
        vertices[i + 1] = pos[1];
        vertices[i + 2] = pos[2];
        i += 3;
      }
    }

    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, (vertices.length / 3 | 0));
    // POINTS, LINE_STRIP, LINE_LOOP, LINES,
    // TRIANGLE_STRIP,TRIANGLE_FAN, TRIANGLES

    //clearInterval(1);

  }, 1000 / 15);
  
  /*
  setTimeout(() => {
    window.open(canvas.toDataURL("image/png"), 'hello');
  }, 2000);
  */

}

/*
 *
 */
((path, a) => {
  function loadjs(src, async = true) {
    return new Promise((res, rej) => 
      document.head.appendChild(Object.assign(document.createElement('script'), {
        src,
        async,
        onload: _ => { res(src) },
        onerror: _ => { rej(src) }
      }))
    )
  }
  Promise.all(a.map(e => loadjs(path + e)))
    .then(_ => window.addEventListener('load', onload))
    .catch(src => console.log(`File "${src}" not loaded`));
})
('www_perlin_surface/js/', [
  //'randomizer.js',
]);
