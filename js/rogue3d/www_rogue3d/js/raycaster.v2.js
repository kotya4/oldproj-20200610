// source: https://dev.opera.com/authors/jacob-seidelin/
var Raycaster = {};


// Constants.
const PI_0_1 = Math.PI * 0 / 1;
const PI_1_1 = Math.PI * 1 / 1;
const PI_2_1 = Math.PI * 2 / 1;
const PI_1_2 = Math.PI * 1 / 2;
const PI_3_2 = Math.PI * 3 / 2;


// Casts ray.
Raycaster.cast = function (angle, from_x, from_y, max_dist, f__solid) {
  if ((angle %= PI_2_1) < 0) angle += PI_2_1;
  const right = angle > PI_3_2 || angle < PI_1_2;
  const up    = angle > PI_1_1 || angle < PI_0_1;
  const sina = Math.sin(angle);
  const cosa = Math.cos(angle);
  // vertical slope
  const vslope = sina / cosa;
  const vdx = right ? 1 : -1;
  const vdy = vdx * vslope;
  // horisontal slope
  const hslope = cosa / sina;
  const hdy = up ? -1 : 1;
  const hdx = hdy * hslope;
  // counters
  let dist = 0;
  let x;
  let y;
  // additional output
  let current_wall_x;
  let current_wall_y;
  let next_wall_x;
  let next_wall_y;
  let hit_x;
  let hit_y;
  let horizontal;
  let texture_x;

  // horisontal
  x = right ? Math.ceil(from_x) : Math.floor(from_x);
  y = from_y + (x - from_x) * vslope;
  for (let i = 0; i < max_dist; ++i) {
    const wall_x = ~~(x - !right);
    const wall_y = ~~(y);
    if (f__solid(wall_x, wall_y)) {
      const dist_x = (x - from_x);
      const dist_y = (y - from_y);
      dist = dist_x * dist_x + dist_y * dist_y;
      // additional output
      current_wall_x = wall_x;
      current_wall_y = wall_y;
      next_wall_x = x + vdx;
      next_wall_y = y + vdy;
      hit_x = x;
      hit_y = y;
      horizontal = true;
      texture_x = y % 1; if (!right) texture_x = 1 - texture_x;
      // exit loop
      break;
    }
    x += vdx;
    y += vdy;
  }

  // vertical
  y = up ? Math.floor(from_y) : Math.ceil(from_y);
  x = from_x + (y - from_y) * hslope;
  for (let i = 0; i < max_dist; ++i) {
    const wall_y = ~~(y - up);
    const wall_x = ~~(x);
    if (f__solid(wall_x, wall_y)) {
      const dist_x = (x - from_x);
      const dist_y = (y - from_y);
      const _dist = dist_x * dist_x + dist_y * dist_y;
      if (!dist || _dist < dist) {
        dist = _dist;
        // additional output
        current_wall_x = wall_x;
        current_wall_y = wall_y;
        next_wall_x = x + hdx;
        next_wall_y = y + hdy;
        hit_x = x;
        hit_y = y;
        horizontal = false;
        texture_x = x % 1; if (up) texture_x = 1 - texture_x;
      }
      // exit loop
      break;
    }
    x += hdx;
    y += hdy;
  }

  // output (greedy)
  return {
    angle, from_x, from_y, max_dist, f__solid, right, up,
    sina, cosa, vslope, vdx, vdy, hslope, hdy, hdx, dist,
    x, y, current_wall_x, current_wall_y, next_wall_x,
    next_wall_y, hit_x, hit_y, horizontal, texture_x,
  };
}


// Checks collisions.
Raycaster.collision = function (ox, oy, nx, ny, radius, f__solid) {
  const x = ~~nx;
  const y = ~~ny;

  if (f__solid(x, y)) return { x: ox, y: oy };

  const block_t = f__solid(x + 0, y - 1);
  const block_b = f__solid(x + 0, y + 1);
  const block_l = f__solid(x - 1, y + 0);
  const block_r = f__solid(x + 1, y + 0);

  if (block_t && 0 - y + ny < radius) ny = 0 + y + radius;
  if (block_b && 1 + y - ny < radius) ny = 1 + y - radius;
  if (block_l && 0 - x + nx < radius) nx = 0 + x + radius;
  if (block_r && 1 + x - nx < radius) nx = 1 + x - radius;

  const r2 = radius * radius;

  // is tile to the top-left a wall
  if (!(block_t && block_l) && f__solid(x - 1, y - 1)) {
    const dx = nx - (x + 0);
    const dy = ny - (y + 0);
    const qx = dx * dx;
    const qy = dy * dy;
    if (qx + qy < r2) { (qx > qy) ? nx = x + radius : ny = y + radius; }
  }
  // is tile to the top-right a wall
  if (!(block_t && block_r) && f__solid(x + 1, y - 1)) {
    const dx = nx - (x + 1);
    const dy = ny - (y + 0);
    const qx = dx * dx;
    const qy = dy * dy;
    if (qx + qy < r2) { (qx > qy) ? nx = x + 1 - radius : ny = y + radius; }
  }
  // is tile to the bottom-left a wall
  if (!(block_b && block_b) && f__solid(x - 1, y + 1)) {
    const dx = nx - (x + 0);
    const dy = ny - (y + 1);
    const qx = dx * dx;
    const qy = dy * dy;
    if (qx + qy < r2) { (qx > qy) ? nx = x + radius : ny = y + 1 - radius; }
  }
  // is tile to the bottom-right a wall
  if (!(block_b && block_r) && f__solid(x + 1, y + 1)) {
    const dx = nx - (x + 1);
    const dy = ny - (y + 1);
    const qx = dx * dx;
    const qy = dy * dy;
    if (qx + qy < r2) { (qx > qy) ? nx = x + 1 - radius : ny = y + 1 - radius; }
  }

  return [nx, ny];
}


// Normalised distance.
Raycaster.distance = function (dist, ray_angle) {
  return Math.sqrt(dist) * Math.cos(ray_angle);
}
