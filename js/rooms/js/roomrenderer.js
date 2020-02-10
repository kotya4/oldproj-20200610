//
function RoomRenderer(rg) {
  const wallheight = 1.5;
  const doorheight = 1.2;

  // VAO data.
  const coordinates = [];
  const texcoords   = [];
  const tangents    = [];
  const normals     = [];
  const indices     = [];

  let wi = 0; // see push_wall

  // Pushes wall geometry into VAO data.
  rg.points.forEach(e => push_wall(e));


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

    coordinates.push(x1, 0, z1, /**/ x2, 0, z2, /**/ x2, wallheight, z2, /**/ x1, wallheight, z1);
    texcoords.push(0, wallheight, /**/ texscaler, wallheight, /**/ texscaler, 0, /**/ 0, 0);
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








  // Creates doorjamps.

  for (let r of rg.rects) {
    if ('gaps' in r) {
      for (let g of r.gaps.B) if ('door' in g) {
        const x1 = g.door[0], x2 = g.door[0] + g.door[2];
        const z1 = g.door[1], z2 = g.door[1] + g.door[3];
        const ts1 = g.door[3];
        const ts2 = (wallheight - doorheight);
        const ts3 = g.door[2];

        // door side

        coordinates.push(x1, 0, z1, /**/ x1, 0, z2, /**/ x1, wallheight, z2, /**/ x1, wallheight, z1);
        texcoords.push(0, wallheight, /**/ ts1, wallheight, /**/ ts1, 0, /**/ 0, 0);
        indices.push(...[0, 1, 2, /**/ 2, 3, 0].map(e => e + (wi << 2)));
        normals.push (+1,  0,  0, /**/ +1,  0,  0, /**/ +1,  0,  0, /**/ +1,  0,  0);
        tangents.push( 0,  0, -1, /**/  0,  0, -1, /**/  0,  0, -1, /**/  0,  0, -1);
        ++wi;

        coordinates.push(x2, 0, z1, /**/ x2, 0, z2, /**/ x2, wallheight, z2, /**/ x2, wallheight, z1);
        texcoords.push(0, wallheight, /**/ ts1, wallheight, /**/ ts1, 0, /**/ 0, 0);
        indices.push(...[0, 1, 2, /**/ 2, 3, 0].map(e => e + (wi << 2)));
        normals.push (-1,  0,  0, /**/ -1,  0,  0, /**/ -1,  0,  0, /**/ -1,  0,  0);
        tangents.push( 0,  0, +1, /**/  0,  0, +1, /**/  0,  0, +1, /**/  0,  0, +1);
        ++wi;

        // door up

        coordinates.push(x1, doorheight, z1, /**/ x2, doorheight, z1, /**/ x2, wallheight, z1, /**/ x1, wallheight, z1);
        texcoords.push(0, ts2, /**/ ts3, ts2, /**/ ts3, 0, /**/ 0, 0);
        indices.push(...[0, 1, 2, /**/ 2, 3, 0].map(e => e + (wi << 2)));
        normals.push ( 0,  0, -1, /**/  0,  0, -1, /**/  0,  0, -1, /**/  0,  0, -1);
        tangents.push(-1,  0,  0, /**/ -1,  0,  0, /**/ -1,  0,  0, /**/ -1,  0,  0);
        ++wi;

        coordinates.push(x1, doorheight, z2, /**/ x2, doorheight, z2, /**/ x2, wallheight, z2, /**/ x1, wallheight, z2);
        texcoords.push(0, ts2, /**/ ts3, ts2, /**/ ts3, 0, /**/ 0, 0);
        indices.push(...[0, 1, 2, /**/ 2, 3, 0].map(e => e + (wi << 2)));
        normals.push ( 0,  0, +1, /**/  0,  0, +1, /**/  0,  0, +1, /**/  0,  0, +1);
        tangents.push(+1,  0,  0, /**/ +1,  0,  0, /**/ +1,  0,  0, /**/ +1,  0,  0);
        ++wi;

        // door up-bottom

        coordinates.push(x1, doorheight, z1, /**/ x2, doorheight, z1, /**/ x2, doorheight, z2, /**/ x1, doorheight, z2);
        texcoords.push(0, ts1, /**/ ts3, ts1, /**/ ts3, 0, /**/ 0, 0);
        indices.push(...[0, 1, 2, /**/ 2, 3, 0].map(e => e + (wi << 2)));
        normals.push ( 0, -1,  0, /**/  0, -1,  0, /**/  0, -1,  0, /**/  0, -1,  0);
        tangents.push(+1,  0,  0, /**/ +1,  0,  0, /**/ +1,  0,  0, /**/ +1,  0,  0);
        ++wi;
      }
      for (let g of r.gaps.R) if ('door' in g) {
        const x1 = g.door[0], x2 = g.door[0] + g.door[2];
        const z1 = g.door[1], z2 = g.door[1] + g.door[3];
        const ts1 = g.door[2];
        const ts2 = (wallheight - doorheight);
        const ts3 = g.door[3];

        // door side

        coordinates.push(x1, 0, z1, /**/ x2, 0, z1, /**/ x2, wallheight, z1, /**/ x1, wallheight, z1);
        texcoords.push(0, wallheight, /**/ ts1, wallheight, /**/ ts1, 0, /**/ 0, 0);
        indices.push(...[0, 1, 2, /**/ 2, 3, 0].map(e => e + (wi << 2)));
        normals.push ( 0,  0, +1, /**/  0,  0, +1, /**/  0,  0, +1, /**/  0,  0, +1);
        tangents.push(+1,  0,  0, /**/ +1,  0,  0, /**/ +1,  0,  0, /**/ +1,  0,  0);
        ++wi;

        coordinates.push(x1, 0, z2, /**/ x2, 0, z2, /**/ x2, wallheight, z2, /**/ x1, wallheight, z2);
        texcoords.push(0, wallheight, /**/ ts1, wallheight, /**/ ts1, 0, /**/ 0, 0);
        indices.push(...[0, 1, 2, /**/ 2, 3, 0].map(e => e + (wi << 2)));
        normals.push ( 0,  0, -1, /**/  0,  0, -1, /**/  0,  0, -1, /**/  0,  0, -1);
        tangents.push(-1,  0,  0, /**/ -1,  0,  0, /**/ -1,  0,  0, /**/ -1,  0,  0);
        ++wi;

        // door up

        coordinates.push(x1, doorheight, z1, /**/ x1, doorheight, z2, /**/ x1, wallheight, z2, /**/ x1, wallheight, z1);
        texcoords.push(0, ts2, /**/ ts3, ts2, /**/ ts3, 0, /**/ 0, 0);
        indices.push(...[0, 1, 2, /**/ 2, 3, 0].map(e => e + (wi << 2)));
        normals.push (-1,  0,  0, /**/ -1,  0,  0, /**/ -1,  0,  0, /**/ -1,  0,  0);
        tangents.push( 0,  0, +1, /**/  0,  0, +1, /**/  0,  0, +1, /**/  0,  0, +1);
        ++wi;

        coordinates.push(x2, doorheight, z1, /**/ x2, doorheight, z2, /**/ x2, wallheight, z2, /**/ x2, wallheight, z1);
        texcoords.push(0, ts2, /**/ ts3, ts2, /**/ ts3, 0, /**/ 0, 0);
        indices.push(...[0, 1, 2, /**/ 2, 3, 0].map(e => e + (wi << 2)));
        normals.push (+1,  0,  0, /**/ +1,  0,  0, /**/ +1,  0,  0, /**/ +1,  0,  0);
        tangents.push( 0,  0, -1, /**/  0,  0, -1, /**/  0,  0, -1, /**/  0,  0, -1);
        ++wi;

        // door up-bottom

        coordinates.push(x1, doorheight, z1, /**/ x1, doorheight, z2, /**/ x2, doorheight, z2, /**/ x2, doorheight, z1);
        texcoords.push(0, ts1, /**/ ts3, ts1, /**/ ts3, 0, /**/ 0, 0);
        indices.push(...[0, 1, 2, /**/ 2, 3, 0].map(e => e + (wi << 2)));
        normals.push ( 0, -1,  0, /**/  0, -1,  0, /**/  0, -1,  0, /**/  0, -1,  0);
        tangents.push(+1,  0,  0, /**/ +1,  0,  0, /**/ +1,  0,  0, /**/ +1,  0,  0);
        ++wi;
      }
    }
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
