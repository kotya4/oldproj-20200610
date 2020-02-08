//
function RoomRenderer(rects) {
  // VAO data.
  const coordinates = [];
  const texcoords   = [];
  const tangents    = [];
  const normals     = [];
  const indices     = [];

  let wi = 0; // see push_wall

  // Pushes wall geometry into VAO data.
  rects.forEach(e => push_wall(e));


  /////////////////////////////////////////////////////


  // Pushes wall geometry into VAO data.
  function push_wall(wall) {
    const dx = wall[2] - wall[0];
    const dz = wall[3] - wall[1];
    const along_x = !!dx;
    const texscaler = Math.abs(dx||dz);
    // z:[-;+] = 0
    // x:[-;+] = 1
    // z:[+;-] = 2
    // x:[+;-] = 3
    let dir; if (along_x) dir = dx > 0 ? 1 : 3; else dir = dz > 0 ? 0 : 2;
    const x1 = wall[0];
    const z1 = wall[1];
    const x2 = x1 + dx;
    const z2 = z1 + dz;

    coordinates.push(x1, 0, z1, /**/ x2, 0, z2, /**/ x2, 1, z2, /**/ x1, 1, z1);
    texcoords.push(0, 1, /**/ texscaler, 1, /**/ texscaler, 0, /**/ 0, 0);
    indices.push(...[0, 1, 2, /**/ 2, 3, 0].map(e => e + (wi << 2)));

    if (dir === 0) {
      normals.push (-1,  0,  0, /**/ -1,  0,  0, /**/ -1,  0,  0, /**/ -1,  0,  0);
      tangents.push( 0,  0, +1, /**/  0,  0, +1, /**/  0,  0, +1, /**/  0,  0, +1);
    } else if (dir === 1) {
      normals.push ( 0,  0, +1, /**/  0,  0, +1, /**/  0,  0, +1, /**/  0,  0, +1);
      tangents.push(+1,  0,  0, /**/ +1,  0,  0, /**/ +1,  0,  0, /**/ +1,  0,  0);
    } else if (dir === 2) {
      normals.push (+1,  0,  0, /**/ +1,  0,  0, /**/ +1,  0,  0, /**/ +1,  0,  0);
      tangents.push( 0,  0, -1, /**/  0,  0, -1, /**/  0,  0, -1, /**/  0,  0, -1);
    } else if (dir === 3) {
      normals.push ( 0,  0, -1, /**/  0,  0, -1, /**/  0,  0, -1, /**/  0,  0, -1);
      tangents.push(-1,  0,  0, /**/ -1,  0,  0, /**/ -1,  0,  0, /**/ -1,  0,  0);
    }

    ++wi;
  }


  // Out.
  return {
    coordinates,
    texcoords,
    tangents,
    normals,
    indices,
  }
}
