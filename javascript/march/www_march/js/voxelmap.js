/*
 *
 */
function VoxelMap() {
  const discrete = {
    map: null,
    create(w, h, d) {
      this.map =
        [...Array(d)].map((_, z) =>
          [...Array(h)].map((_, y) =>
            [...Array(w)].map((_, x) =>
              Math.random() >= 0.5)));
      return this;
    },
    for_each(func) {
      for (let z = 0; z < this.map.length; ++z)
        for (let y = 0; y < this.map[0].length; ++y)
          for (let x = 0; x < this.map[0][0].length; ++x)
            func(this.map[z][y][x], x, y, z, this.map);
      return this;
    },
    sizes() {
      return [this.map[0][0].length, this.map[0].length, this.map.length];
    },
  };

  const gen_mesh = (marcher) => {

    const WIDTH  = 5;
    const HEIGHT = 5;
    const DEPTH  = 5;

    discrete.create(WIDTH - 2, HEIGHT - 2, DEPTH - 2);

    const coord = [];

    for (let x = 0; x < WIDTH; ++x)
      for (let y = 0; y < HEIGHT; ++y)
        for (let z = 0; z < DEPTH; ++z)
    {
      const _x = x - 1;
      const _y = y - 1;
      const _z = z - 1;

      const f = (x, y, z) => !!(((discrete.map[z] || [])[y] || [])[x]);

      const cube_coords = marcher.march(f, _x, _y, _z, false);

      // coord
      coord.push(...cube_coords);
    }

    console.log(coord);

    const vertices_num = coord.length / 3;

    // color
    const color = [...Array(vertices_num)].map((_, i) => [1, 1, 1, 1]).flat();

    const faces_num = vertices_num / 3;

    const normal = [];

    for (let i = 0; i < coord.length; ) {
      const face_normal = WebGL.create_face_normal(
        coord[i++], coord[i++], coord[i++],
        coord[i++], coord[i++], coord[i++],
        coord[i++], coord[i++], coord[i++],
      );
      // normal
      normal.push(...face_normal, ...face_normal, ...face_normal);
    }

    // indices
    const indices = [...Array(vertices_num)].map((_, i) => i);

    // texcoord
    const texcoord = [...Array(vertices_num)].map((_, i) => [0, 0]).flat();

    const vbo = {
      coord, // 3
      color, // 4
      normal, // 3
      indices, // 1
      texcoord, // 2
    };

    return vbo;
  }


  return {
    gen_mesh,

  }
}
