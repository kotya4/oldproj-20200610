let ctx = null; // REMOVE

/**
 *  @class Point
 *  @type {Object}
 *  @property {number} x The X-coordinate.
 *  @property {number} y The Y-coordinate.
 */
function Point(...position) {
  return {
    position,
    draw: (ctx, radius = 2) => {
      ctx.beginPath();
      ctx.arc(...position, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}



function Line(...points) {
  return {
    points,
    draw: (ctx, draw_points = false) => {
      ctx.beginPath();
      ctx.moveTo(...points[0].position);
      ctx.lineTo(...points[1].position);
      ctx.stroke();
      if (draw_points) points.forEach(e => e.draw(ctx));
    }
  }
}



function Wall(x1, y1, x2, y2, tex) {
  const points = [Point(x1, y1), Point(x2, y2)];
  const line = Line(...points);
  const rect = [Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1)];
  return {
    tex,
    line,
    rect,
    points,
    draw(ctx) {
      //ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
      //ctx.fillRect(...rect);
      ctx.fillStyle = ctx.strokeStyle = tex.color
        || `rgb(${~~(Math.random() * 256)}, ${~~(Math.random() * 256)}, ${~~(Math.random() * 256)})`;
      line.draw(ctx, true);
    },
    intersects(p2_x,  p2_y,  p3_x,  p3_y) {
      const p0_x = points[0].position[0];
      const p0_y = points[0].position[1];
      const p1_x = points[1].position[0];
      const p1_y = points[1].position[1];
      const s1_x = p1_x - p0_x;
      const s1_y = p1_y - p0_y;
      const s2_x = p3_x - p2_x;
      const s2_y = p3_y - p2_y;
      const s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
      const t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);
      if (s >= 0 && s <= 1 && t >= 0 && t <= 1) return [p0_x + (t * s1_x), p0_y + (t * s1_y)];
      return null;
    },
  }
}



/**
 * @param {Array} walls - finite number of lines (walls) on the surface
 * @param {Number} size - width/height of the quad
 * TODO: @param {Array} offset - offset from left top side of the surface
 */
function Grid(walls, size) {
  // finds further point from (0, 0)
  const furthest = [0, 0];
  for (let wall of walls) {
    const x = wall.rect[0] + wall.rect[2];
    const y = wall.rect[1] + wall.rect[3];
    if (x > furthest[0]) furthest[0] = x;
    if (y > furthest[1]) furthest[1] = y;
  }
  // creates empty grid
  const width = Math.ceil(1 + furthest[0] / size);
  const height = Math.ceil(1 + furthest[1] / size);
  const map = [...Array(width)]
    .map((_, x) => [...Array(height)]
      .map((_, y) => ({
        // TODO: there can be keys for teleportation between grids and blocks and so on.
        //       edit 'get' methodd if you want to add something
        //corner: x === 0 || x === width - 1 || y === 0 || y === height - 1,
        walls: [],
  })));
  // loads grid with walls
  for (let w of walls) {
    const x0 = w.points[0].position[0];
    const y0 = w.points[0].position[1];
    const x1 = w.points[1].position[0];
    const y1 = w.points[1].position[1];
    const _x = x1 - x0;
    const _y = y1 - y0;
    const mag = Math.sqrt(_x * _x + _y * _y);
    const dx = _x / mag;
    const dy = _y / mag;
    for (let i = 0; i < mag; ++i) {
      const x = ~~((x0 + i * dx) / size);
      const y = ~~((y0 + i * dy) / size);
      if (null == get(x, y).walls.find(e => e === w)) get(x, y).walls.push(w);
    }
  }

  function get(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return { walls: [] };
    // makes map torus
    //x %= width; if (x < 0) x = width + x;
    //y %= height; if (y < 0) y = height + y;
    return map[x][y];
  }

  return {
    size,
    get,

    draw(ctx) {
      // draws grid
      ctx.strokeStyle = 'black';
      for (let x = 0; x < map.length; ++x) {
        for (let y = 0; y < map[0].length; ++y) {
          ctx.fillStyle = map[x][y].walls.length
            ? `rgba(0, 0, 255, ${map[x][y].walls.length / walls.length})`
            : `rgba(255, 255, 255, 0.3)`;
          const _x = x * size;
          const _y = y * size;
          ctx.fillRect(_x, _y, size, size);
          ctx.strokeRect(_x, _y, size, size);
        }
      }
      // draws walls
      //ctx.fillStyle = ctx.strokeStyle = 'white';
      for (let w of walls) w.draw(ctx);
    },
    hitted(x, y) {
      return get(x, y).walls.length > 0;
    }
  }
}


/**
 * Drawing engine
 */
function Raycaster() {

  return {
    cast_ray(x0, y0, angle, grid, max_dist = 0xff) {
      if ((angle %= Math.PI * 2) < 0) angle += Math.PI * 2;      // [0; 2PI)
      const ri = angle > Math.PI * 1.5 || angle < Math.PI * 0.5; // I or IV
      const up = angle > Math.PI;                                // III or IV
      const cosa = Math.cos(angle);
      const sina = Math.sin(angle);

      const vslope = sina / cosa;
      const vdx = ri ? +1 : -1;   // vertical step delta x
      const vdy = vdx * vslope;   // vertical step delta y

      const hslope = cosa / sina;
      const hdy = up ? -1 : +1;   // horisontal step delta y
      const hdx = hdy * hslope;   // horisontal step delta x

      // computes
      // TODO: can be parallelized

      let vdist = Infinity;
      let vx = ri ? Math.ceil(x0) : Math.floor(x0);
      let vy = y0 + (vx - x0) * vslope;
      let vwx = ~~x0;
      let vwy = ~~y0;
      for (let INF = Math.abs(max_dist); INF--; ) {
        if (grid.hitted(vwx, vwy)) {
          const _x = vx - x0;
          const _y = vy - y0;
          vdist = _x * _x + _y * _y;
          break;
        }
        vx += vdx;
        vy += vdy;
        vwx = ~~(vx - !ri);
        vwy = ~~(vy);
      }

      let hdist = Infinity;
      let hy = up ? Math.floor(y0) : Math.ceil(y0);
      let hx = x0 + (hy - y0) * hslope;
      let hwx = ~~x0;
      let hwy = ~~y0;
      for (let INF = Math.abs(max_dist); INF--; ) {
        if (grid.hitted(hwx, hwy)) {
          const _x = hx - x0;
          const _y = hy - y0;
          hdist = _x * _x + _y * _y;
          break;
        }
        hx += hdx;
        hy += hdy;
        hwx = ~~(hx);
        hwy = ~~(hy - up);
      }

      // returns

      if (vdist < hdist) {
        return {
          tex: ri ? vy % 1 : 1 - vy % 1, // texture coordinate [0; 1)
          hit: [vx, vy],                 // where ray stopped when hits the wall
          wall: [vwx, vwy],              // hitted wall coordinates
          dist: vdist,                   // squared distance
        }
      }

      return {
        tex: up ? 1 - hx % 1 : hx % 1, // texture coordinate [0; 1)
        hit: [hx, hy],                 // where ray stopped when hits the wall
        wall: [hwx, hwy],              // hitted wall coordinates
        dist: hdist,                   // squared distance
      }
    },
    /**
     * @param {Object} block - object with 'walls' array in it
     * @param {Array} rect - block's [left, top, right, bottom] in world coordinates
     * @param {Array} start_pos - ray's start position in world coordinates
     * @param {Array} end_pos - ray's end position in world coordinates (f.e. x + cos(a) * 0xff, y + sin(a) * 0xff)
     * @param {Array} slices - will be loaded with information about distances, textures and so on
     * @param {Function} [draw_circle] - for debugging (REMOVE)
     * @returns {Boolean} is found wall was NOT transparent?
     */
    intersects(block, rect, start_pos, end_pos, slices, draw_circle) {
      const checked = block.walls.map(_ => false);  // to skip checked walls in iteration

      // do while intransparent wall was found OR all walls were checked
      for (let checked_num = 0; checked_num < block.walls.length; ++checked_num) {
        let nearest_dist = Infinity;
        let nearest_wall = null;
        let nearest_point = null;
        let nearest_index = -1;

        // find nearest wall in block
        for (let i = 0; i < block.walls.length; ++i) {
          if (checked[i]) continue; // wall was checked in previous iteration

          const w = block.walls[i];
          const p = w.intersects(...start_pos, ...end_pos);

          if (!p // ray does not intersect the wall OR intersection point not in the block
          ||  p[0] < rect[0] || p[0] > rect[2]
          ||  p[1] < rect[1] || p[1] > rect[3])
          {
            checked[i] = true;
            continue;
          }

          const _x = p[0] - start_pos[0];
          const _y = p[1] - start_pos[1];
          const d = _x * _x + _y * _y;

          if (!nearest_wall || nearest_dist > d) {
            nearest_dist = d;
            nearest_wall = w;
            nearest_point = p;
            nearest_index = i;
          }
        }

        if (!nearest_wall) return false; // no wall was found

        checked[nearest_index] = true;

        slices.push({ // saves texture information and squared distance
          pos: nearest_point,
          tex: nearest_wall.tex,
          dist: nearest_dist,
        });

        if (!nearest_wall.tex.transparent) { // wall is not transparent

          // REMOVE
          if (draw_circle) draw_circle(nearest_point[0], nearest_point[1], 4, 'lightgreen');

          return true;
        }

        // REMOVE
        if (draw_circle) draw_circle(nearest_point[0], nearest_point[1], 2, 'lightgreen');
      }

      return false; // intransparent wall was not found
    },

  }

}
