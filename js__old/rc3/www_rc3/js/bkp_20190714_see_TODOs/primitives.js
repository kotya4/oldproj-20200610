
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
      ctx.fillStyle = ctx.strokeStyle = tex.color || ~~(Math.random() * 0xffffff);
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
 * @param [Array] walls - finite number of lines (walls) on the surface
 * @param [Number] size - width/height of the quad
 * TODO: @param [Array] offset - offset from left top side of the surface
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
  const width = Math.ceil(furthest[0] / size);
  const height = Math.ceil(furthest[1] / size);
  const map = [...Array(width)]
    .map((_, x) => [...Array(height)]
      .map((_, y) => ({
        // TODO: there can be keys for teleportation between grids and blocks and so on
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
      if (null == map[x][y].walls.find(e => e === w)) map[x][y].walls.push(w);
    }
  }
  return {
    size,

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
      ctx.fillStyle = ctx.strokeStyle = 'white';
      for (let w of walls) w.draw(ctx);
    },



    get(x, y) {
      x %= width; if (x < 0) x = width + x;
      y %= height; if (y < 0) y = height + y;
      return map[x][y];
    },

    hitted(x, y) {
      return !!this.get(x, y).walls.length;
    }
  }
}


function Raycaster() {

  return {
    cast_ray(x0, y0, angle, grid, max_dist = 0xff) {
      if ((angle %= Math.PI * 2) < 0) angle += Math.PI * 2;      // [0; 2PI)
      const ri = angle > Math.PI * 1.5 || angle < Math.PI * 0.5; // I or IV
      const up = angle > Math.PI;                                // III or IV
      const sina = Math.sin(angle);
      const cosa = Math.cos(angle);

      const vslope = sina / cosa;
      const vdx = ri ? +1 : -1;   // vertical step delta x
      const vdy = vdx * vslope;   // vertical step delta y

      const hslope = cosa / sina;
      const hdy = up ? -1 : +1;   // horisontal step delta y
      const hdx = hdy * hslope;   // horisontal step delta x

      // computes
      // TODO: can be parallelized

      let vdist = -1;
      let vx = ri ? Math.ceil(x0) : Math.floor(x0);
      let vy = y0 + (vx - x0) * vslope;
      let vwx, vwy;
      for (let INF = Math.abs(max_dist); INF--; ) {
        vwx = ~~(vx - !ri);
        vwy = ~~(vy);
        if (grid.hitted(vwx, vwy)) {
          const _x = vx - x0;
          const _y = vy - y0;
          vdist = _x * _x + _y * _y;
          break;
        }
        vx += vdx;
        vy += vdy;
      }

      let hdist = -1;
      let hy = up ? Math.floor(y0) : Math.ceil(y0);
      let hx = x0 + (hy - y0) * hslope;
      let hwx, hwy;
      for (let INF = Math.abs(max_dist); INF--; ) {
        hwx = ~~(hx);
        hwy = ~~(hy - up);
        if (grid.hitted(hwx, hwy)) {
          const _x = hx - x0;
          const _y = hy - y0;
          hdist = _x * _x + _y * _y;
          break;
        }
        hx += hdx;
        hy += hdy;
      }

      // returns

      if (vdist < hdist) {
        return {
          tex: ri ? vy % 1 : 1 - vy % 1,            // texture coordinate [0; 1)
          hit: [vx, vy],                            // where ray stopped when hits the wall
          wall: [vwx, vwy],                         // hitted wall coordinates
          dist: vdist,                              // squared distance
        }
      }

      return {
        tex: up ? 1 - hx % 1 : hx % 1,           // texture coordinate [0; 1)
        hit: [hx, hy],                           // where ray stopped when hits the wall
        wall: [hwx, hwy],                        // hitted wall coordinates
        dist: hdist,                             // squared distance
      }
    },
  }

}
