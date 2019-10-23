function Voxelmap2(W, H, D) {

  const HW = W / 2 - 0.5;
  const HH = H / 2 - 0.5;
  const HD = D / 2 - 0.5;


  const volume =
        [...Array(D)].map((_, z) =>
          [...Array(H)].map((_, y) =>
            [...Array(W)].map((_, x) =>
              1))); // Math.random() >= 0.5)));


  function for_each(func) {
    for (let z = 0; z < D; ++z)
      for (let y = 0; y < H; ++y)
        for (let x = 0; x < W; ++x)
          func(volume[z][y][x], x, y, z, volume, W, H, D);
  }


  function sizes() {
    return [W, H, D];
  }


  function generate_mesh() {
    const coords = [
      [0, 0, 0],
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
      [0, 0, 1],
      [0, 1, 1],
      [1, 1, 1],
      [1, 0, 1],
    ];

    const make_coords = (i, x, y, z) => [coords[i][0] + x, coords[i][1] + y, coords[i][2] + z];

    const faces = {
      z0: [0, 1, 2, 2, 3, 0],
      z1: [4, 5, 6, 6, 7, 4],
      y0: [0, 4, 7, 7, 3, 0],
      y1: [1, 5, 6, 6, 2, 1],
      x0: [0, 1, 5, 5, 4, 0],
      x1: [3, 2, 6, 6, 7, 3],
    };

    const mesh = {
      coord: [],
      color: [],
      normal: [],
      indices: [],
      texcoord: [],
    };

    for (let z = 0; z < D; ++z)
      for (let y = 0; y < H; ++y)
        for (let x = 0; x < W; ++x)
    {
      if (volume[z][y][x] > 0) {
        const z0 = Utils.array_safe_value(volume, [z - 1, y + 0, x + 0]) > 0;
        const y0 = Utils.array_safe_value(volume, [z + 0, y - 1, x + 0]) > 0;
        const x0 = Utils.array_safe_value(volume, [z + 0, y + 0, x - 1]) > 0;
        const z1 = Utils.array_safe_value(volume, [z + 1, y + 0, x + 0]) > 0;
        const y1 = Utils.array_safe_value(volume, [z + 0, y + 1, x + 0]) > 0;
        const x1 = Utils.array_safe_value(volume, [z + 0, y + 0, x + 1]) > 0;

        if (!z0) { mesh.coord.push(...faces.z0.map(e => make_coords(e, x, y, z)).flat()); for (let k = 0; k < 6; ++k) mesh.color.push(0, 0, 1, 1); }
        if (!z1) { mesh.coord.push(...faces.z1.map(e => make_coords(e, x, y, z)).flat()); for (let k = 0; k < 6; ++k) mesh.color.push(0, 1, 0, 1); }
        if (!y0) { mesh.coord.push(...faces.y0.map(e => make_coords(e, x, y, z)).flat()); for (let k = 0; k < 6; ++k) mesh.color.push(0, 1, 1, 1); }
        if (!y1) { mesh.coord.push(...faces.y1.map(e => make_coords(e, x, y, z)).flat()); for (let k = 0; k < 6; ++k) mesh.color.push(1, 0, 0, 1); }
        if (!x0) { mesh.coord.push(...faces.x0.map(e => make_coords(e, x, y, z)).flat()); for (let k = 0; k < 6; ++k) mesh.color.push(1, 0, 1, 1); }
        if (!x1) { mesh.coord.push(...faces.x1.map(e => make_coords(e, x, y, z)).flat()); for (let k = 0; k < 6; ++k) mesh.color.push(1, 1, 0, 1); }
      }
    }

    for (let i = 0; i < mesh.coord.length; ) {
      const normal = WebGL.create_face_normal(
        mesh.coord[i++], mesh.coord[i++], mesh.coord[i++],
        mesh.coord[i++], mesh.coord[i++], mesh.coord[i++],
        mesh.coord[i++], mesh.coord[i++], mesh.coord[i++],
      );
      for (let k = 0; k < 3; ++k) mesh.normal.push(...normal);
    }

    for (let i = 0; i < mesh.coord.length; ++i) {
      mesh.texcoord.push(0, 0);
    }

    for (let i = 0; i < mesh.coord.length / 3; ++i) {
      mesh.indices.push(i);
    }

    return mesh;
  }


  function mirror_x(direction = 0) {
    for (let z = 0; z < D; ++z)
      for (let y = 0; y < H; ++y)
        for (let x = 0; x < W / 2; ++x)
    {
      if (direction > 0) volume[z][y][x] = volume[z][y][W - x - 1];
      else if (direction < 0) volume[z][y][W - x - 1] = volume[z][y][x];
    }
  }


  function mirror_y(direction = 0) {
    for (let z = 0; z < D; ++z)
      for (let y = 0; y < H / 2; ++y)
        for (let x = 0; x < W; ++x)
    {
      if (direction > 0) volume[z][y][x] = volume[z][H - y - 1][x];
      else if (direction < 0) volume[z][H - y - 1][x] = volume[z][y][x];
    }
  }


  function mirror_z(direction = 0) {
    for (let z = 0; z < D / 2; ++z)
      for (let y = 0; y < H; ++y)
        for (let x = 0; x < W; ++x)
    {
      if (direction > 0) volume[z][y][x] = volume[D - z - 1][y][x];
      else if (direction < 0) volume[D - z - 1][y][x] = volume[z][y][x];
    }
  }


  /* Hyper function of hyperboloid (not exactly).
   * Some arguments examples: elipsoid   : (10, 1, 0.5, 0.75).
                              hyperboloid: (10, 1, -1, 1).
                              sphere     : (10).
   * R is radius.
   * Sign is shape invertor.
   * Mask is flag: will shape substracts or adds to voxelmap.
   */
  function hyperboloid(r, a = 1, b = 1, c = 1, sign = +1, mask = 1, ox = 0, oy = 0, oz = 0) {
    for_each((v, x, y, z, map, w, h, d) => {
      const _x = a ? (x - HW - ox) ** 2 / a : 0;
      const _y = b ? (y - HH - oy) ** 2 / b : 0;
      const _z = c ? (z - HD - oz) ** 2 / c : 0;
      const value = (r - (_x + _y + _z)) * sign;
      if (Math.sign(value) === Math.sign(mask)) map[z][y][x] = value;
    });
  }


  return {
    generate_mesh,
    for_each,
    volume,
    sizes,
    mirror_x,
    mirror_y,
    mirror_z,
    hyperboloid,
  }
}
