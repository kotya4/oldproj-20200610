//
function MapManager(opt) {

  const tilemanager = opt.tilemanager;
  const height = opt.height;
  const width = opt.width;


  const map = Array(width * height).fill().map(_ => Math.random()*2|0);
  map[-1] = -1; // "Error index" contains "error tile".


  return {
    tilemanager,
    height,
    width,
    map,
    // functions
    to_screencoords,
    to_mapcoords,
    to_index,
    get_tile_index,
    set_tile_index,
    get_tile,
    crashing,
  };


  // Converts screen coordintes to map coordinates.
  function to_mapcoords(x, y) {
    return [(x / tilemanager.tilesize), (y / tilemanager.tilesize)];
  }


  // Converts map coordintes to screen coordinates.
  function to_screencoords(x, y) {
    return [(x * tilemanager.tilesize), (y * tilemanager.tilesize)];
  }


  // Converts map coordinates to map index.
  function to_index(x, y) {
    x = ~~x;
    y = ~~y;
    if (x < 0 || y < 0 || x >= width || y >= height) return -1; // Returns "error index".
    return x + y * width;
  }


  // Puts tile index into map.
  function set_tile_index(x, y, ti) {
    const i = to_index(x, y);
    if (i >= 0) map[i] = ti;
    return i; // Returns map index.
  }


  // Gets tile index from map.
  function get_tile_index(x, y) {
    return map[to_index(x, y)];
  }


  // Gets tile from map.
  function get_tile(x, y) {
    return tilemanager.get(get_tile_index(x, y));
  }


  // Modifies "creature.pos" and returns crashing status.
  function crashing(creature, direction) {
    const block_x_left   = ~~(creature.pos[0] - 0.5 + creature.tilebox.left  );
    const block_x_right  = ~~(creature.pos[0] + 0.5 - creature.tilebox.right );
    const block_y_top    = ~~(creature.pos[1] - 1.0 + creature.tilebox.top   );
    const block_y_bottom = ~~(creature.pos[1] + 0.0 - creature.tilebox.bottom);
    const eps = 1e-6; // HACK: tl;dr normalized block size NOT contain supremum and infimum

    // __debug.ctx.fillStyle = 'rgba(0, 250, 250, 0.2)';
    // const plt = __game__.pos_to_pixel(block_x_left, block_y_top);
    // const prt = __game__.pos_to_pixel(block_x_right, block_y_top);
    // const plb = __game__.pos_to_pixel(block_x_left, block_y_bottom);
    // const prb = __game__.pos_to_pixel(block_x_right, block_y_bottom);
    // __debug.ctx.fillRect(plt.x, plt.y, __game__.block_size_px - 1, __game__.block_size_px - 1);
    // __debug.ctx.fillRect(prt.x, prt.y, __game__.block_size_px - 1, __game__.block_size_px - 1);
    // __debug.ctx.fillRect(plb.x, plb.y, __game__.block_size_px - 1, __game__.block_size_px - 1);
    // __debug.ctx.fillRect(prb.x, prb.y, __game__.block_size_px - 1, __game__.block_size_px - 1);

    if (direction === 'left') {
      for (let y = block_y_top; y <= block_y_bottom; ++y) {
        if (get_tile(block_x_left, y).solid) {
          creature.pos[0] = block_x_left + 1 + 0.5 - creature.tilebox.left + eps;
          return true;
    } } }

    if (direction === 'right') {
      for (let y = block_y_top; y <= block_y_bottom; ++y) {
        if (get_tile(block_x_right, y).solid) {
          creature.pos[0] = block_x_right + 0 - 0.5 + creature.tilebox.right - eps;
          return true;
    } } }

    if (direction === 'up') {
      for (let x = block_x_left; x <= block_x_right; ++x) {
        if (get_tile(x, block_y_top).solid) {
          creature.pos[1] = block_y_top + 1 + 1.0 - creature.tilebox.top + eps;
          return true;
    } } }

    if (direction === 'down') {
      for (let x = block_x_left; x <= block_x_right; ++x) {
        if (get_tile(x, block_y_bottom).solid) {
          creature.pos[1] = block_y_bottom + 0 - 0.0 + creature.tilebox.bottom - eps;
          return true;
    } } }

    return false;
  }






}
