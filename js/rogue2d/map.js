function Map(display_sizes) {
  if (!display_sizes) throw Error(`Map: 'display_sizes' not provided`);

  const block_size = __game__.block_size_px;

  const width = ~~(display_sizes.width / block_size);
  const height = ~~(display_sizes.height / block_size);

  const map =
    [...Array(width)].map((_, x) =>
      [...Array(height)].map((_, y) => ~~(Math.random() * 2)));


  function update_from_storage(storage) {
    const loaded = storage.load('map');
    if (!loaded) return false;

    const w = Math.min(loaded.length, map.length);
    const h = Math.min(loaded[0].length, map[0].length);

    for (let x = 0; x < w; ++x)
      for (let y = 0; y < h; ++y)
        map[x][y] = loaded[x][y];

    return true;
  }


  function cvt_to_map(x, y) {
    return {
      x: (x / block_size),
      y: (y / block_size),
    }
  }


  function cvt_to_display(x, y) {
    return {
      x: (x * block_size),
      y: (y * block_size),
    }
  }


  function draw_mouse(ctx, x, y) {
    const _p = cvt_to_map(x, y);
    const p_ = cvt_to_display(~~_p.x, ~~_p.y);
    ctx.fillStyle = 'rgba(100, 200, 100, 0.6)';
    ctx.fillRect(p_.x, p_.y, block_size, block_size);
  }


  function put_to(x, y, o) {
    x = ~~x;
    y = ~~y;
    if (x < 0 || y < 0 || x >= map.length || y >= map[0].length) return false;
    map[x][y] = o;
    return true;
  }


  function draw(ctx) {
    ctx.fillStyle = 'grey';
    for (let x = 0; x < map.length; ++x)
      for (let y = 0; y < map[0].length; ++y)
        if (map[x][y])
          ctx.fillRect(x * block_size, y * block_size, block_size, block_size);
  }


  function solid(x, y) {
    x = ~~x;
    y = ~~y;
    if (x < 0 || y < 0 || x >= map.length || y >= map[0].length) return false;
    return map[x][y] === 1;
  }


  return {
    map,
    block_size,
    update_from_storage,
    cvt_to_map,
    cvt_to_display,
    draw_mouse,
    put_to,
    draw,
    solid,
  }
}
