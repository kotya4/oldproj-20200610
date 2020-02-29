//
window.onload = function () {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = 320;
  ctx.canvas.height = 240;
  document.body.appendChild(ctx.canvas);

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



  const player = {
    x: 7,
    y: 17,
    dir: 0,
    rot: 1,
    speed: 0,
    move_speed: 0.2,
    rot_speed: 0.1
  };

  const minimap_scale = 2;

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

    ctx.fillStyle = 'red';
    ctx.fillText(`${player.x} ${player.y}`, 20, 20);
  }



  function is_solid(x, y) {
    if (x < 0 || y < 0) return true;
    x %= map.length;
    y %= map[0].length;
    return map[x][y];
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
      const [x, y] = Raycaster.collision(player.x, player.y, player.x + dx, player.y + dy, 0.5, is_solid);
      player.x = x;
      player.y = y;
    }
  }


  const fov = Math.PI / 2.5;

  const max_dist = 100;

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const strip_width = 10;
  const rays_number = width / strip_width;
  const angle_step = fov / rays_number;


  function draw_scene() {

    let ray_angle = -(fov / 2);

    for (let i = 0; i < rays_number; ++i) {

      ray_angle += angle_step;

      const { dist } = Raycaster.cast(player.rot + ray_angle, player.x, player.y, max_dist, is_solid);

      if (dist) {
        const sdist = Raycaster.distance(dist, ray_angle);

        const strip_height = height / sdist;

        const left = width - strip_width * i;
        const top = (height - strip_height) / 2;

        const c = (256 / sdist) << 1;

        ctx.fillStyle = `rgb(${c},${c},${c})`;
        ctx.fillRect(left, top, -strip_width, strip_height);

      }

    }
  }




  function is_solid(x, y) {
    if (x < 0 || y < 0) return true;
    x %= map.length;
    y %= map[0].length;
    return map[x][y];
  }






  setInterval(() => {

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    draw_scene();

    draw_minimap();

    keyboard();


  }, 50);

}
