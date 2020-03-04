// source: https://lodev.org/cgtutor/raycasting2.html
var Raycaster = {

  setup({ map, textures, player }) {
    if (map) this.map = map;
    if (textures) this.textures = textures;
    if (player)   this.player   = player;
  }

};



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






Raycaster.cast_floor = function (ctx) {

  let { dirX, dirY, planeX, planeY, x:posX, y:posY } = this.player;
  posX = posX;
  posY = posY;

  const screenHeight = ctx.canvas.height;
  const screenWidth = ctx.canvas.width;
  const h = screenHeight / 2;

  const texWidth = this.textures.width;
  const texHeight = this.textures.height;


  const myImageData = ctx.getImageData(0, 0, screenWidth, screenHeight);
  const texture_data = this.textures.data;


  for(let y = 0; y < h; y++) {
    // rayDir for leftmost ray (x = 0) and rightmost ray (x = w)
    let rayDirX0 = -(dirX - planeX);
    let rayDirY0 = -(dirY - planeY);
    let rayDirX1 = -(dirX + planeX);
    let rayDirY1 = -(dirY + planeY);

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
      let floorTexture = this.get_map(cellX,cellY);
      // console.log(floorX,floorY)

      // let ceilingTexture = 6;

      const k = (tx + ty*texWidth + floorTexture*this.textures.width*this.textures.height)*4;
      const i = (x + y*screenWidth)*4;
      const j = (x + (screenHeight-y-1)*screenWidth)*4;

      // ceiling
      myImageData.data[0 + i] = texture_data[0 + k];
      myImageData.data[1 + i] = texture_data[1 + k];
      myImageData.data[2 + i] = texture_data[2 + k];
      myImageData.data[3 + i] = texture_data[3 + k];

      // floor
      myImageData.data[0 + j] = texture_data[0 + k];
      myImageData.data[1 + j] = texture_data[1 + k];
      myImageData.data[2 + j] = texture_data[2 + k];
      myImageData.data[3 + j] = texture_data[3 + k];

    }
  }
  ctx.putImageData(myImageData, 0, 0);
}







Raycaster.cast_walls = function (ctx) {
  const max_dist = 100;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const { dirX, dirY, planeX, planeY, x:posX, y:posY } = this.player;

  const texWidth = this.textures.width;
  const texHeight = this.textures.height;



  const buffer = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const tdata = this.textures.data;



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
      if (this.is_map_solid_at(mapX, mapY)) hit = 1;
      // if (map[mapX][mapY] > 0) hit = 1;
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
    let texNum = this.get_map(mapX,mapY);

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



    for (let y = drawStart|0; y<drawEnd; y++) {
      // Cast the texture coordinate to integer, and mask with (texHeight - 1) in case of overflow
      let texY = (~~texPos) & (texHeight - 1);
      texPos += step;


      const k = ((texX + texY*texWidth + texNum*this.textures.width*this.textures.height)*4);
      const i = ((x + y*w)*4);
      buffer.data[0 + i] = tdata[0 + k];
      buffer.data[1 + i] = tdata[1 + k];
      buffer.data[2 + i] = tdata[2 + k];
      buffer.data[3 + i] = tdata[3 + k];
    }

  }

  ctx.putImageData(buffer, 0, 0);
}










// Checks collisions.
// ox,oy  - old position
// nx,ny  - new position
// radius - collision offset
Raycaster.collision = function (ox, oy, nx, ny, radius) {
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


