// source: https://lodev.org/cgtutor/raycasting2.html
var Raycaster = {
  // Some constants.
  ignore_ceiling:     true, // ignores ceiling on draw
  ignore_floor:      false, // ignores floor on draw
  floor_limit:           1, // blank part of floor/ceiling from screen center in pixels
  walls_distance:       50, // max ray length in map units
  walls_brightness:     20,
  floor_brightness:     20,
  side_color: [20, 20, 20], // additional rgba color for side wall
  // Sets up raycaster scene.
  setup({ map, textures, camera_opt }) {
    if (null != map) this.map = map;
    if (null != textures) this.textures = textures;
    if (null != camera_opt) {
      // Defines camera.
      this.camera = {
        // Sets up camera.
        setup(position, rotation, move_speed, rot_speed) {
          // Initial direction vector.
          this.dir_x = -1.0;
          this.dir_y = +0.0;
          // The 2d raycaster version of camera plane.
          this.plane_x = 0.00;
          this.plane_y = 0.66;
          // Position in map units.
          if (null != position) {
            this.pos_x = position[0];
            this.pos_y = position[1];
          }
          // Rotation.
          this.rotation = 0;
          if (rotation) {
            this.rotate(rotation);
          }
          // Moving and rotation mutipliers.
          if (null != move_speed) this.move_speed = move_speed;
          if (null !=  rot_speed) this.rot_speed  =  rot_speed;
        },
        // Both camera direction and camera plane must be rotated.
        rotate(rot_speed) {
          const rsdx = Math.cos(rot_speed);
          const rsdy = Math.sin(rot_speed);
          const dirx = this.dir_x;
          const plax = this.plane_x;
          this.dir_x = dirx * rsdx - this.dir_y * rsdy;
          this.dir_y = dirx * rsdy + this.dir_y * rsdx;
          this.plane_x = plax * rsdx - this.plane_y * rsdy;
          this.plane_y = plax * rsdy + this.plane_y * rsdx;
          this.rotation += rot_speed;
        },
      };
      // Sets up camera.
      this.camera.setup(...camera_opt);
    }
  },
};


// Casts walls and draws.
Raycaster.cast_walls = function (ctx) {
  // Camera.
  const { pos_x, pos_y, dir_x, dir_y, plane_x, plane_y } = this.camera;
  // Display size.
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  // Display image data for pixel manipulating.
  const display = ctx.getImageData(0, 0, W, H);

  // Casing walls.
  for(let x = 0; x < W; ++x) {
    const camera_x = 2 * x / W - 1;               // x-coordinate in camera space.
    const ray_dir_x = dir_x + plane_x * camera_x; // Ray position and direction.
    const ray_dir_y = dir_y + plane_y * camera_x; //
    const delta_x = Math.abs(1 / ray_dir_x);      // Length of ray from one x or y-side to next x or y-side.
    const delta_y = Math.abs(1 / ray_dir_y);      //
    let map_x = ~~pos_x; // Which box of the map we're in.
    let map_y = ~~pos_y; //
    let side_dist_x;     // Length of ray from current position to next x or y-side.
    let side_dist_y;     //
    let step_x;          // What direction to step in x or y-direction (either +1 or -1).
    let step_y;          //
    // Calculating step and initial side_dist.
    if (ray_dir_x < 0) { step_x = -1; side_dist_x = -delta_x * (    map_x - pos_x); }
    else               { step_x = +1; side_dist_x = +delta_x * (1 + map_x - pos_x); }
    if (ray_dir_y < 0) { step_y = -1; side_dist_y = -delta_y * (    map_y - pos_y); }
    else               { step_y = +1; side_dist_y = +delta_y * (1 + map_y - pos_y); }

    // Performing DDA.
    let side = 0; // Was a NS or a EW wall hit?
    let hit  = 0; // Was there a wall hit?
    for (let INF = 0; !hit && INF < this.walls_distance; ++INF) {
      // Jump to next map square, OR in x-direction, OR in y-direction.
      if (side_dist_x < side_dist_y) { side_dist_x += delta_x; map_x += step_x; side = 0; }
      else                           { side_dist_y += delta_y; map_y += step_y; side = 1; }
      // Check if ray has hit a wall.
      if (this.is_map_solid_at(map_x, map_y)) hit = 1;
    }

    // Wall was hit by ray.
    if (hit) {
      // Distance of perpendicular ray (Euclidean distance will give fisheye effect!).
      let perp_wall_dist;
      if (side == 0) perp_wall_dist = (map_x - pos_x + (1 - step_x) / 2) / ray_dir_x;
      else           perp_wall_dist = (map_y - pos_y + (1 - step_y) / 2) / ray_dir_y;
      // Height of strip to draw on screen.
      const strip_height = ~~(H / perp_wall_dist);
      // Lowest and highest pixel to fill in current strip.
      let strip_start = (-strip_height + H) / 2; if(strip_start <  0) strip_start =     0;
      let strip_end   = (+strip_height + H) / 2; if(strip_end   >= H) strip_end   = H - 1;
      // Where exactly the wall was hit?
      let wall_x = (side === 0) ? (pos_y + perp_wall_dist * ray_dir_y) : (pos_x + perp_wall_dist * ray_dir_x);
      wall_x -= ~~wall_x;
      // x coordinate on the texture.
      let tx = ~~(wall_x * this.textures.width);
      if(side == 0 && ray_dir_x > 0) tx = this.textures.width - tx - 1;
      if(side == 1 && ray_dir_y < 0) tx = this.textures.width - tx - 1;
      // How much to increase the texture coordinate per screen pixel?
      const step = 1.0 * this.textures.height / strip_height;
      // Starting texture coordinate.
      let tex_pos = (strip_start - H / 2 + strip_height / 2) * step;
      // Fade out by distance.
      const brightness = Math.min(1, Math.max(0.1, 1 - (perp_wall_dist / this.walls_brightness)));
      // Texture index.
      const texture_index = this.get_map(map_x, map_y);

      // Draw.
      for (let y = ~~strip_start; y < strip_end; ++y) {
        // Cast the texture coordinate to integer, and mask with (texture_height - 1) in case of overflow.
        const ty = (~~tex_pos) & (this.textures.height - 1);
        tex_pos += step;
        // Indices of display and texture.
        const d = 4 * (x + y * W);
        const t = 4 * (tx + (ty + texture_index * this.textures.height) * this.textures.width);
        // Apply pixels to the display.
        display.data[0+d] = ~~this.textures.data[0+t]*brightness+this.side_color[0]*side;
        display.data[1+d] = ~~this.textures.data[1+t]*brightness+this.side_color[1]*side;
        display.data[2+d] = ~~this.textures.data[2+t]*brightness+this.side_color[2]*side;
        display.data[3+d] = ~~this.textures.data[3+t];
      }
    }
  }
  // Refreshes display.
  ctx.putImageData(display, 0, 0);
}


// Casts floor/ceiling and draws.
Raycaster.cast_floor = function (ctx) {
  if (this.ignore_ceiling && this.ignore_floor) return;

  // Camera.
  const { pos_x, pos_y, dir_x, dir_y, plane_x, plane_y } = this.camera;
  // Display size.
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  // Display image data for pixel manipulating.
  const display = ctx.getImageData(0, 0, W, H);

  // Casting floor/ceiling.
  for(let y = 0; y < H / 2 - this.floor_limit; ++y) {
    // ray_dir for leftmost ray (x = 0) and rightmost ray (x = w)
    const ray_dir_x0 = dir_x - plane_x;
    const ray_dir_y0 = dir_y - plane_y;
    const ray_dir_x1 = dir_x + plane_x;
    const ray_dir_y1 = dir_y + plane_y;
    // Current y position compared to the center of the screen (the horizon).
    const p = (H / 2 - y) || 1;
    // Vertical position of the camera.
    const pos_z = 0.5 * H;
    // Horizontal distance from the camera to the floor for the current row.
    // 0.5 is the z position exactly in the middle between floor and ceiling.
    const row_dist = pos_z / p;
    // calculate the real world step vector we have to add for each x (parallel to camera plane)
    // adding step by step avoids multiplications with a weight in the inner loop
    const step_x = row_dist * (ray_dir_x1 - ray_dir_x0) / W;
    const step_y = row_dist * (ray_dir_y1 - ray_dir_y0) / W;
    // Fade out by distance.
    const brightness = Math.min(1, Math.max(0.1, 1 - (row_dist / this.floor_brightness)));

    // Real world coordinates of the leftmost column. This will be updated as we step to the right.
    let floor_x = pos_x + row_dist * ray_dir_x0;
    let floor_y = pos_y + row_dist * ray_dir_y0;
    // Casts floor/ceiling for current row.
    for(let x = 0; x < W; ++x) {
      // The cell coord is simply got from the integer parts of floor_x and floor_y.
      const cell_x = ~~(floor_x);
      const cell_y = ~~(floor_y);
      // Gets the texture coordinate from the fractional part.
      let tx = ~~(this.textures.width  * (floor_x - cell_x)) & (this.textures.width  - 1);
      let ty = ~~(this.textures.height * (floor_y - cell_y)) & (this.textures.height - 1);
      // Updating real world coordinates.
      floor_x += step_x;
      floor_y += step_y;

      if (!this.ignore_ceiling) {
        // Ceiling texture index.
        let ceiling_texture_index = this.get_map(cell_x, cell_y);
        // Texture pixel index for CEILING.
        const tC = 4 * (tx + this.textures.width * (ty + ceiling_texture_index * this.textures.height));
        // Display pixel index for TOP.
        const dT = 4 * (x + W * y);
        // Drawing ceiling.
        display.data[0+dT] = ~~this.textures.data[0+tC]*brightness;
        display.data[1+dT] = ~~this.textures.data[1+tC]*brightness;
        display.data[2+dT] = ~~this.textures.data[2+tC]*brightness;
        display.data[3+dT] = ~~this.textures.data[3+tC];
      }

      if (!this.ignore_floor) {
        // Floor texture index.
        let floor_texture_index = this.get_map(cell_x, cell_y);
        // Texture pixel index for FLOOR.
        const tF = 4 * (tx + this.textures.width * (ty + floor_texture_index * this.textures.height));
        // Display pixel index for BOTTOM.
        const dB = 4 * (x + W * (H - y - 1));
        // Drawing floor.
        display.data[0+dB] = ~~this.textures.data[0+tF]*brightness;
        display.data[1+dB] = ~~this.textures.data[1+tF]*brightness;
        display.data[2+dB] = ~~this.textures.data[2+tF]*brightness;
        display.data[3+dB] = ~~this.textures.data[3+tF];
      }
    }
  }
  // Refreshes display.
  ctx.putImageData(display, 0, 0);
}


// Checks collisions.
Raycaster.collision = function (ox, oy, dx, dy, radius) {
  // ox,oy  - old position
  // nx,ny  - new position
  // radius - collision offset
  let nx = ox + dx;
  let ny = oy + dy;
  const x = ~~nx;
  const y = ~~ny;

  if (this.is_map_solid_at(x,y)) return [ox, oy];

  const block_t = this.is_map_solid_at(x  ,y-1);
  const block_b = this.is_map_solid_at(x  ,y+1);
  const block_l = this.is_map_solid_at(x-1,y  );
  const block_r = this.is_map_solid_at(x+1,y  );

  if (block_t && 0-y+ny < radius) ny = 0+y+radius;
  if (block_b && 1+y-ny < radius) ny = 1+y-radius;
  if (block_l && 0-x+nx < radius) nx = 0+x+radius;
  if (block_r && 1+x-nx < radius) nx = 1+x-radius;

  const r2 = radius * radius;

  // is tile to the top-left a wall
  if (!(block_t && block_l) && this.is_map_solid_at(x-1,y-1)) {
    const dx = nx - (x+0);
    const dy = ny - (y+0);
    const qx = dx * dx;
    const qy = dy * dy;
    if (qx + qy < r2) { (qx > qy) ? nx = x + radius : ny = y + radius; }
  }
  // is tile to the top-right a wall
  if (!(block_t && block_r) && this.is_map_solid_at(x+1,y-1)) {
    const dx = nx - (x+1);
    const dy = ny - (y+0);
    const qx = dx * dx;
    const qy = dy * dy;
    if (qx + qy < r2) { (qx > qy) ? nx = x + 1 - radius : ny = y + radius; }
  }
  // is tile to the bottom-left a wall
  if (!(block_b && block_b) && this.is_map_solid_at(x-1,y+1)) {
    const dx = nx - (x+0);
    const dy = ny - (y+1);
    const qx = dx * dx;
    const qy = dy * dy;
    if (qx + qy < r2) { (qx > qy) ? nx = x + radius : ny = y + 1 - radius; }
  }
  // is tile to the bottom-right a wall
  if (!(block_b && block_r) && this.is_map_solid_at(x+1,y+1)) {
    const dx = nx - (x+1);
    const dy = ny - (y+1);
    const qx = dx * dx;
    const qy = dy * dy;
    if (qx + qy < r2) { (qx > qy) ? nx = x + 1 - radius : ny = y + 1 - radius; }
  }

  return [nx, ny];
}







Raycaster.get_map = function (x, y) {
  if (x < 0 || y < 0) return 0;
  x %= this.map.length;
  y %= this.map[0].length;
  return Math.abs(this.map[x][y])%this.textures.number;
}



Raycaster.is_map_solid_at = function (x, y) {
  if (x < 0 || y < 0) return true;
  x %= this.map.length;
  y %= this.map[0].length;
  return this.map[x][y] > 0;
}




