let is_solid = () => { throw Error('is_solid'); }
let ray_cast_size = null;

function cast_ray(angle, from_x, from_y, max_dist = 1000) {
  const TWO_PI = 2 * Math.PI;

  if ((angle %= TWO_PI) < 0) angle += TWO_PI;

  const right = angle > TWO_PI * 0.75 || angle < TWO_PI * 0.25;
  const up = angle < 0 || angle > TWO_PI * 0.5;

  const sina = Math.sin(angle);
  const cosa = Math.cos(angle);

  const vslope = sina / cosa;
  const vdx = right ? ray_cast_size : -ray_cast_size;
  const vdy = vdx * vslope;

  const hslope = cosa / sina;
  const hdy = up ? -ray_cast_size : ray_cast_size;
  const hdx = hdy * hslope;

  let horizontal = false;
  let hit_x = 0;
  let hit_y = 0;
  let dist = 0;
  let tex_x;
  let x;
  let y;

  let hit_wall_x = 0;
  let hit_wall_y = 0;
  let next_wall_x = 0;
  let next_wall_y = 0;

  x = right ? Math.ceil(from_x) : Math.floor(from_x);
  y = from_y + (x - from_x) * vslope;

  for (let i = 0; i < max_dist; ++i) {
    const wall_x = ~~(x - !right);
    const wall_y = ~~y;

    if (is_solid(wall_x, wall_y)) {
      const dist_x = x - from_x;
      const dist_y = y - from_y;
      dist = dist_x * dist_x + dist_y * dist_y;

      tex_x = y % 1;
      if (!right) tex_x = 1 - tex_x;

      hit_x = x;
      hit_y = y;
      hit_wall_x = wall_x;
      hit_wall_y = wall_y;
      next_wall_x = wall_x + vdx;
      next_wall_y = wall_y + vdy;

      horizontal = true;

      break;
    }
    x += vdx;
    y += vdy;
  }

  y = up ? Math.floor(from_y) : Math.ceil(from_y);
  x = from_x + (y - from_y) * hslope;

  for (let i = 0; i < max_dist; ++i) {
    const wall_y = ~~(y - up);
    const wall_x = ~~x;

    if (is_solid(wall_x, wall_y)) {
      const dist_x = x - from_x;
      const dist_y = y - from_y;
      const blockDist = dist_x * dist_x + dist_y * dist_y;
      if (!dist || blockDist < dist) {
        dist = blockDist;
        hit_x = x;
        hit_y = y;
        hit_wall_x = wall_x;
        hit_wall_y = wall_y;
        next_wall_x = wall_x + hdx;
        next_wall_y = wall_y + hdy;

        tex_x = x % 1;
        if (up) tex_x = 1 - tex_x;

        horizontal = false;
      }
      break;
    }
    x += hdx;
    y += hdy;
  }

  return {
    dist,
    hit_x,
    hit_y,
    hit_wall_x,
    hit_wall_y,
    next_wall_x,
    next_wall_y,
  }
}
