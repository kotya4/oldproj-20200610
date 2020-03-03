// source: https://lodev.org/cgtutor/raycasting2.html
var Raycaster = {

  setup({ worldMap, textures, spawn }) {

    this.worldMap = worldMap;
    this.textures = textures;
    this.dirX = -1;
    this.dirY = 0;
    this.planeX = 0;
    this.planeY = 0.66;

  }

};




// Constants.
const PI_0_1 = Math.PI * 0 / 1;
const PI_1_1 = Math.PI * 1 / 1;
const PI_2_1 = Math.PI * 2 / 1;
const PI_1_2 = Math.PI * 1 / 2;
const PI_3_2 = Math.PI * 3 / 2;



Raycaster.cast_wall = (ctx, player, texture, f__solid) => {
  const max_dist = 100;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const buffer = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
  const { dirX, dirY, planeX, planeY, x:posX, y:posY } = player;
  // const worldMap = map;
  const texWidth = texture.width;
  const texHeight = texture.height;

  for(let x = 0; x < w; x++) {
    //calculate ray position and direction
    let cameraX = 2 * x / w - 1; //x-coordinate in camera space
    let rayDirX = dirX + planeX * cameraX;
    let rayDirY = dirY + planeY * cameraX;

    //which box of the map we're in
    let mapX = ~~posX;
    let mapY = ~~posY;

    //length of ray from current position to next x or y-side
    let sideDistX;
    let sideDistY;

    //length of ray from one x or y-side to next x or y-side
    let deltaDistX = Math.abs(1 / rayDirX);
    let deltaDistY = Math.abs(1 / rayDirY);
    let perpWallDist;

    //what direction to step in x or y-direction (either +1 or -1)
    let stepX;
    let stepY;

    let hit = 0; //was there a wall hit?
    let side; //was a NS or a EW wall hit?

    //calculate step and initial sideDist
    if (rayDirX < 0) {
      stepX = -1;
      sideDistX = (posX - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1.0 - posX) * deltaDistX;
    }

    if (rayDirY < 0) {
      stepY = -1;
      sideDistY = (posY - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1.0 - posY) * deltaDistY;
    }

    //perform DDA
    for (let INF = 0; INF < max_dist && !hit; ++INF) { // while (hit == 0) {
      //jump to next map square, OR in x-direction, OR in y-direction
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }
      //Check if ray has hit a wall
      if (f__solid(mapX, mapY)) hit = 1;
      // if (worldMap[mapX][mapY] > 0) hit = 1;
    }

    //Calculate distance of perpendicular ray (Euclidean distance will give fisheye effect!)
    // if (side == 0) perpWallDist = (mapX - posX + (1 - stepX) / 2) / rayDirX;
    // else           perpWallDist = (mapY - posY + (1 - stepY) / 2) / rayDirY;

    if (side == 0) perpWallDist = (mapX - posX + (1 - stepX) / 2) / rayDirX;
    else           perpWallDist = (mapY - posY + (1 - stepY) / 2) / rayDirY;

    //Calculate height of line to draw on screen
    let lineHeight = ~~(h / perpWallDist);

    //calculate lowest and highest pixel to fill in current stripe
    let drawStart = -lineHeight / 2 + h / 2; if(drawStart <  0) drawStart =     0;
    let drawEnd   = +lineHeight / 2 + h / 2; if(drawEnd   >= h) drawEnd   = h - 1;
    //texturing calculations
    // int texNum = worldMap[mapX][mapY] - 1; //1 subtracted from it so that texture 0 can be used!

    //calculate value of wallX
    let wallX; //where exactly the wall was hit
    if (side == 0) wallX = posY + perpWallDist * rayDirY;
    else           wallX = posX + perpWallDist * rayDirX;
    wallX -= ~~wallX;

    //x coordinate on the texture
    let texX = ~~(wallX * texWidth);
    if(side == 0 && rayDirX > 0) texX = texWidth - texX - 1;
    if(side == 1 && rayDirY < 0) texX = texWidth - texX - 1;

    // How much to increase the texture coordinate per screen pixel
    let step = 1.0 * texHeight / lineHeight;
    // Starting texture coordinate
    let texPos = (drawStart - h / 2 + lineHeight / 2) * step;



    const sx = texX;
    const sy = 0;
    const sw = step;
    const sh = texHeight;
    const dx = x|0;
    const dy = -lineHeight / 2 + h / 2;
    const dw = step>1?step:1;
    const dh = lineHeight|0;
    ctx.drawImage(texture, sx, sy, sw, sh, dx, dy, dw, dh);

    // ctx.fillStyle = 'green';
    // ctx.fillText(`${dw}`, 10, 50+10*x);


    // for (let y = drawStart; y<drawEnd; y++) {
    //   // Cast the texture coordinate to integer, and mask with (texHeight - 1) in case of overflow
    //   let texY = (~~texPos) & (texHeight - 1);
    //   texPos += step;

    //   // TODO

    //   texture

    //   Uint32 color = texture[texNum][texWidth * texY + texX];
    //   //make color darker for y-sides: R, G and B byte each divided through two with a "shift" and an "and"
    //   if(side == 1) color = (color >> 1) & 8355711;
    //   buffer[y][x] = color;
    // }

  }
}














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



Raycaster.horizontal_cast = function (textures, ctx, img, player) {

  let { dirX, dirY, planeX, planeY, x:posX, y:posY } = player;
  posX = -posX;
  posY = -posY;

  const screenHeight = ctx.canvas.height;
  const screenWidth = ctx.canvas.width;
  const h = screenHeight / 2;

  const texWidth = 128;
  const texHeight = 128;


  const myImageData = ctx.createImageData(screenWidth, screenHeight);
  const texture_data = textures.getImageData(0, 0, textures.canvas.width, textures.canvas.height).data;


  for(let y = 0; y < h; y++) {
    // rayDir for leftmost ray (x = 0) and rightmost ray (x = w)
    let rayDirX0 = dirX - planeX;
    let rayDirY0 = dirY - planeY;
    let rayDirX1 = dirX + planeX;
    let rayDirY1 = dirY + planeY;

    // Current y position compared to the center of the screen (the horizon)
    let p = y - screenHeight / 2;

    // Vertical position of the camera.
    let posZ = 0.5 * screenHeight;

    // Horizontal distance from the camera to the floor for the current row.
    // 0.5 is the z position exactly in the middle between floor and ceiling.
    let rowDistance = posZ / p;

    // calculate the real world step vector we have to add for each x (parallel to camera plane)
    // adding step by step avoids multiplications with a weight in the inner loop
    let floorStepX = rowDistance * (rayDirX1 - rayDirX0) / screenWidth;
    let floorStepY = rowDistance * (rayDirY1 - rayDirY0) / screenWidth;

    // real world coordinates of the leftmost column. This will be updated as we step to the right.
    let floorX = posX + rowDistance * rayDirX0;
    let floorY = posY + rowDistance * rayDirY0;



    for(let x = 0; x < screenWidth; ++x) {
      // the cell coord is simply got from the integer parts of floorX and floorY
      let cellX = ~~(floorX);
      let cellY = ~~(floorY);

      // get the texture coordinate from the fractional part
      let tx = ~~(texWidth * (floorX - cellX)) & (texWidth - 1);
      let ty = ~~(texHeight * (floorY - cellY)) & (texHeight - 1);

      floorX += floorStepX;
      floorY += floorStepY;

      // choose texture and draw the pixel
      // let floorTexture = 3;
      // let ceilingTexture = 6;

      const k = (tx + ty*texWidth)*4;
      const i = (x + y*screenWidth)*4;
      const j = (x + (screenHeight-y-1)*screenWidth)*4;
      myImageData.data[0 + i] = texture_data[0 + k];
      myImageData.data[1 + i] = texture_data[1 + k];
      myImageData.data[2 + i] = texture_data[2 + k];
      myImageData.data[3 + i] = texture_data[3 + k];

      myImageData.data[0 + j] = texture_data[0 + k];
      myImageData.data[1 + j] = texture_data[1 + k];
      myImageData.data[2 + j] = texture_data[2 + k];
      myImageData.data[3 + j] = texture_data[3 + k];



      // const sx = tx;
      // const sy = ty;
      // const sw = 1;
      // const sh = 1;
      // const dx = x;
      // const dy = y;
      // const dw = 1;
      // const dh = 1;
      // ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      // ctx.drawImage(img, sx, sy, sw, sh, dx, screenHeight-dy-1, dw, dh);
    }
  }
  ctx.putImageData(myImageData, 0, 0);
}
