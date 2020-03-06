
include('www_rc2/js/', [

]).then(_ => {


  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = 320;
  ctx.canvas.height = 240;
  document.getElementsByClassName('wrapper')[0].appendChild(ctx.canvas);

  const keys = {};
  window.onkeyup = e => keys[e.keyCode] = false;
  window.onkeydown = e => keys[e.keyCode] = true;


  const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
    [1,0,0,1,0,1,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,1,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [0,0,0,1,0,1,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];


  /*
  const map = [
    '##  ### # ###',
    '#       #   #',
    '# ## #    # #',
    '     #  # #  ',
    '#   ##  #   #',
    '#         # #',
    '##  ### # ###',
  ].map(e => e.split('').map(e => e === ' ' ? 0 : 1));
  */

  const player = {
    x: 4,
    y: 3,
    dir: 0,
    rot: 0,
    speed: 0,
    move_speed: 0.2,
    rot_speed: 0.1
  };

  const minimap_scale = 4;

  function draw_ray(ox, oy, x, y) {
    const grad = ctx.createLinearGradient(oy * minimap_scale, ox * minimap_scale, y * minimap_scale, x  * minimap_scale);
    grad.addColorStop(0, 'yellow');
    grad.addColorStop(1, 'red');

    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(oy * minimap_scale, ox * minimap_scale);
    ctx.lineTo(y * minimap_scale, x * minimap_scale);
    ctx.stroke();
  }

  function draw_minimap() {
    const s = 10;
    for (let x = 0; x < map.length; ++x) for (let y = 0; y < map[0].length; ++y) {
      ctx.fillStyle = map[x][y] ? 'grey' : 'black';
      ctx.fillRect(y * minimap_scale, x * minimap_scale, minimap_scale, minimap_scale);
    }

    ctx.fillStyle = 'white';
    ctx.fillRect(player.y * minimap_scale - minimap_scale / 2, player.x * minimap_scale - minimap_scale / 2, minimap_scale, minimap_scale);

    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(player.y * minimap_scale, player.x * minimap_scale);
    ctx.lineTo(player.y * minimap_scale + Math.sin(player.rot) * 20, player.x * minimap_scale + Math.cos(player.rot) * 20);
    ctx.stroke();
  }

  function keyboard() {
    // rotation
    if (keys[65]) {
      player.rot += player.rot_speed;
    }
    if (keys[68]) {
      player.rot -= player.rot_speed;
    }
    // movement
    let dx = 0;
    let dy = 0;
    if (keys[87]) {
      dx += Math.cos(player.rot) * player.move_speed;
      dy += Math.sin(player.rot) * player.move_speed;
    }
    if (keys[83]) {
      dx -= Math.cos(player.rot) * player.move_speed;
      dy -= Math.sin(player.rot) * player.move_speed;
    }
    if (dx || dy) {
      const { x, y } = check_collision(player.x, player.y, player.x + dx, player.y + dy, 0.5);
      player.x = x;
      player.y = y;
    }
  }

  /*
  function is_out_of_border(x, y) {
    return y < 0 || y >= map[0].length || x < 0 || x >= map.length;
  }
  */

  function is_solid(x, y) {
    if (x < 0 || y < 0) return true;
    x %= map.length;
    y %= map[0].length;
    return map[x][y];
  }

  function check_collision(ox, oy, nx, ny, radius) {
    const x = ~~nx;
    const y = ~~ny;

    if (is_solid(x, y)) return { x: ox, y: oy };

    const block_t = is_solid(x + 0, y - 1);
    const block_b = is_solid(x + 0, y + 1);
    const block_l = is_solid(x - 1, y + 0);
    const block_r = is_solid(x + 1, y + 0);

    if (block_t && 0 - y + ny < radius) ny = 0 + y + radius;
    if (block_b && 1 + y - ny < radius) ny = 1 + y - radius;
    if (block_l && 0 - x + nx < radius) nx = 0 + x + radius;
    if (block_r && 1 + x - nx < radius) nx = 1 + x - radius;

    const r2 = radius * radius;

    if (!(block_t && block_l) && is_solid(x - 1, y - 1)) { // is tile to the top-left a wall
      const dx = nx - (x + 0);
      const dy = ny - (y + 0);
      const qx = dx * dx;
      const qy = dy * dy;
      if (qx + qy < r2)
        if (qx > qy) nx = x + radius; else ny = y + radius;
    }

    if (!(block_t && block_r) && is_solid(x + 1, y - 1)) { // is tile to the top-right a wall
      const dx = nx - (x + 1);
      const dy = ny - (y + 0);
      const qx = dx * dx;
      const qy = dy * dy;
      if (qx + qy < r2)
        if (qx > qy) nx = x + 1 - radius; else ny = y + radius;
    }

    if (!(block_b && block_b) && is_solid(x - 1, y + 1)) { // is tile to the bottom-left a wall
      const dx = nx - (x + 0);
      const dy = ny - (y + 1);
      const qx = dx * dx;
      const qy = dy * dy;
      if (qx + qy < r2)
        if (qx > qy) nx = x + radius; else ny = y + 1 - radius;
    }

    if (!(block_b && block_r) && is_solid(x + 1, y + 1)) { // is tile to the bottom-right a wall
      const dx = nx - (x + 1);
      const dy = ny - (y + 1);
      const qx = dx * dx;
      const qy = dy * dy;
      if (qx + qy < r2)
        if (qx > qy) nx = x + 1 - radius; else ny = y + 1 - radius;
    }

    return { x: nx, y: ny };
  }



  const fov = Math.PI / 2.5;
  const TWO_PI = 2 * Math.PI;
  const max_dist = 100;


  function draw_scene(width, height, strip_width = 1) {

    const rays_number = width / strip_width;
    const angle_step = fov / rays_number;
    let ray_angle = -(fov / 2);

    for (let i = 0; i < rays_number; ++i) {


      ray_angle += angle_step;


      const { dist } = cast_ray(player.rot + ray_angle, player.x, player.y);

      if (dist) {
        const sdist = Math.sqrt(dist) * Math.cos(ray_angle); // straight distance

        const strip_height = height / sdist;

        const left = width - strip_width * i;
        const top = (height - strip_height) / 2;

        const c = (256 / sdist) << 1;

        ctx.fillStyle = `rgb(${c},${c},${c})`;
        ctx.fillRect(left, top, -strip_width, strip_height);

      }

    }
  }

  function cast_ray(angle, from_x, from_y) {
    if ((angle %= TWO_PI) < 0) angle += TWO_PI;

    const right = angle > TWO_PI * 0.75 || angle < TWO_PI * 0.25;
    const up = angle < 0 || angle > TWO_PI * 0.5;

    const sina = Math.sin(angle);
    const cosa = Math.cos(angle);

    const vslope = sina / cosa;
    const vdx = right ? 1 : -1;
    const vdy = vdx * vslope;

    const hslope = cosa / sina;
    const hdy = up ? -1 : 1;
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
        next_wall_x = x + vdx;
        next_wall_y = y + vdy;

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
          next_wall_x = x + hdx;
          next_wall_y = y + hdy;

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

    }
  }

  setInterval(() => {


    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    draw_scene(ctx.canvas.width, ctx.canvas.height);

    draw_minimap();

    keyboard();


  }, 50);

});
