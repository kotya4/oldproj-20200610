
function Maze(height, width, corridor = 0) {
  const map = U.alloc([height, width], -1);

  const stack = [];
  let x = width / 2 | 0;
  let y = height / 2 | 0;
  let generation_started = false;

  /*
  do {
    const old_x = x;
    const old_y = y;
    let ds, d;
    switch (corridor) {
    case 1: ds = U.shuffle_with_chance([0, 1, 2, 3], [1, 9000, 1, 1]); break; // vertical
    case 2: ds = U.shuffle_with_chance([0, 1, 2, 3], [9000, 1, 1, 1]); break; // horisontal
    default: ds = U.shuffle([0, 1, 2, 3]); break;
    }
    for (let i = 0; i < ds.length; ++i) {
      d = ds[i];
      switch (d) {
      case 0: --y; break;
      case 1: ++x; break;
      case 2: ++y; break;
      case 3: --x; break;
      }
      if (x < 0) x = width - 1; else if (x >= width) x = 0;
      if (y < 0) y = height - 1; else if (y >= height) y = 0;
      if (map[y][x] < 0) {
        stack.push([x, y]);
        break;
      }
      x = old_x;
      y = old_y;
    }
    map[old_y][old_x] = d & 1;
    if (x === old_x && y === old_y) [x, y] = stack.pop();
  } while (stack.length);
  */

  function do_next() {
    // saves from multiple outside calling without checking stack size
    if (generation_started) if (!stack.length) return 0;
    generation_started = true;
    const old_x = x;
    const old_y = y;
    let ds, d;
    switch (corridor) {
    case 1: ds = U.shuffle_with_chance([0, 1, 2, 3], [1, 9000, 1, 1]); break; // vertical
    case 2: ds = U.shuffle_with_chance([0, 1, 2, 3], [9000, 1, 1, 1]); break; // horisontal
    default: ds = U.shuffle([0, 1, 2, 3]); break;
    }
    for (let i = 0; i < ds.length; ++i) {
      d = ds[i];
      switch (d) {
      case 0: --y; break;
      case 1: ++x; break;
      case 2: ++y; break;
      case 3: --x; break;
      }
      if (x < 0) x = width - 1; else if (x >= width) x = 0;
      if (y < 0) y = height - 1; else if (y >= height) y = 0;
      if (map[y][x] < 0) {
        stack.push([x, y]);
        break;
      }
      x = old_x;
      y = old_y;
    }
    if (map[old_y][old_x] < 0) map[old_y][old_x] = d & 1; // is if-statement nessesary?
    if (x === old_x && y === old_y) [x, y] = stack.pop();
    return stack.length;
  }

  function draw(ctx, ox = 0, oy = 0, w = 10, h = 10) {
    for (let y = 0; y < height; ++y)
      for (let x = 0; x < width; ++x)
        map[y][x]
          ? ctx.fillRect(ox + x * w - w, oy + y * h, w, 1)
          : ctx.fillRect(ox + x * w, oy + y * h - h, 1, h);
  }

  function sampling() {
    const smap = U.alloc([height * 2 + 1, width * 2 + 1], 0);
    for (let y = 0; y < height; ++y)
      for (let x = 0; x < width; ++x)
        if (map[y][x])
          smap[2 + y * 2][0 + x * 2] =
            smap[2 + y * 2][1 + x * 2] =
              smap[2 + y * 2][2 + x * 2] = 1;
        else
          smap[0 + y * 2][2 + x * 2] =
            smap[1 + y * 2][2 + x * 2] =
              smap[2 + y * 2][2 + x * 2] = 1;
    return smap;
  }

  return {
    map,
    draw,
    sampling,
    do_next,
    stack
  }
}
