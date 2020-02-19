
window.onload = function () {


  ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = 640;
  ctx.canvas.height = 480;
  document.body.appendChild(ctx.canvas);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);


  const mouse = {
    x: 0,
    y: 0,
  };


  function draw_line(x1, y1, x2, y2, color) {
    if (!color) color = `rgb(${~~(Math.random() * 256)}, ${~~(Math.random() * 256)}, ${~~(Math.random() * 256)})`;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }


  function draw_circle(x, y, radius, color) {
    if (!color) color = `rgb(${~~(Math.random() * 256)}, ${~~(Math.random() * 256)}, ${~~(Math.random() * 256)})`;
    if (!radius) radius = 1 + ~~(Math.random() * 50);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }


  let trans; // REMOVE
  const map_width = 100;
  const map_height = 100;

  /*
  const walls = [...Array(10)].map(e => Wall( ~~(Math.random() * map_width),
                                              ~~(Math.random() * map_height),
                                              ~~(Math.random() * map_width),
                                              ~~(Math.random() * map_height),
                                              { // texture information

                                                color: (trans = Math.random()) < 0.5 ? 'yellow' : 'white',
                                                transparent: trans < 0.5,

                                              }));
  */


  const walls = [
    Wall(10, 10, 15, 90, { color: 'red', transparent: false }),
    Wall(15, 90, 85, 80, { color: 'yellow' }),
    Wall(85, 80, 95, 20, { color: 'blue' }),
    Wall(95, 20, 10, 10, { color: 'green' }),
  ];


  const grid = Grid(walls, map_width / 2, [0, 0]);


  const raycaster = Raycaster();





  // некоторые лучи вылетают за границы просто так, по непонятным причинам.
  // их много, около половины всех лучей в зависимости от угла и количества лучей.
  // не знаю как исправить. да и не очень хочется уже. эх....... 20190715
  // UPD half hour later: Я ИСПРАВИЛ БЛЯТЬ. дело было в ray_cast и -1 вместо инфинити.



  const max_ray_len = 200;
  const max_grid_len = ~~(max_ray_len / grid.size);
  const fov = Math.PI / 4;
  const slice_width = 5;
  const slices_num = ctx.canvas.width / slice_width;
  const angle_step = fov / slices_num;

  let last_timestamp = 0;
  (function draw_frame(timestamp) {
    const elapsed = timestamp - last_timestamp;
    last_timestamp = timestamp;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    grid.draw(ctx);

    const x0 = mouse.x / grid.size; // ray start position (in grid coordinates)
    const y0 = mouse.y / grid.size;

    const start_pos = [ // ray start position in world coordinates
      mouse.x,
      mouse.y,
    ];

    let max_slices_len = 0; // REMOVE

    let angle = fov / 2 - angle_step; //+ player_angle;
    for (let index = 0; index < slices_num; ++index) {
      angle += angle_step;

      let x = x0; // changes over iterasions
      let y = y0;

      const cosa = Math.cos(angle); // rays direction modules
      const sina = Math.sin(angle);

      const end_pos = [ // ray end position in world coordinates
        mouse.x + cosa * max_ray_len,
        mouse.y + sina * max_ray_len,
      ];

      const slices = []; // stack with all textures/distances (iterate backward to draw)

      // neither start searching for all blocks in the way of ray. do it
      // until ray intersects with intransparent wall.
      for (let INF = 0xf; INF--; ) {
        const ray = raycaster.cast_ray(x, y, angle, grid, max_grid_len);
        if (ray.dist === Infinity) break; // ray goes to infinity

        // REMOVE
        //draw_circle(ray.hit[0] * grid.size, ray.hit[1] * grid.size, 2, 'yellow');
        //draw_circle(ray.wall[0] * grid.size, ray.wall[1] * grid.size, 2, 'yellow');

        const block = grid.get(...ray.wall);

        // TODO: if block has own texture? do not need test for walls in it then.
        //       is block texture is transparent? if so, do not exit from loop.

        const rect = [
          grid.size * ray.wall[0],
          grid.size * ray.wall[1],
          grid.size * (1 + ray.wall[0]),
          grid.size * (1 + ray.wall[1]),
        ];

        if (raycaster.intersects(block, rect, start_pos, end_pos, slices)) break;

        // slightly changing ray's start position to test next wall
        // and continue casting same ray.
        x = ray.hit[0] + cosa / 0xffffffff;
        y = ray.hit[1] + sina / 0xffffffff;
      }

      // draws all slices
      // TODO: texture must to be scaled (walls, blocks, etc. - each has various size)

      if (slices.length) draw_line(...start_pos, ...slices[slices.length - 1].pos, 'lightgreen');
      else draw_line(...start_pos, ...end_pos, 'red');

       // REMOVE
      max_slices_len = max_slices_len < slices.length ? slices.length : max_slices_len;

      for (let i = slices.length - 1; i >= 0; --i) {
        const slice = slices[i];

        const tex = slice.tex;
        const dist = Math.sqrt(slice.dist) * Math.cos(angle - fov / 2 - angle_step);

        const slice_height = ctx.canvas.height / dist * grid.size / 2;

        const c = ~~(256 * 10 / dist);
        ctx.fillStyle = `rgba(${c},${c},${c},${tex.transparent ? 0.5 : 1.0})`;
        ctx.fillRect(index * slice_width, (ctx.canvas.height - slice_height) / 2, slice_width, slice_height);

        //ctx.fillRect(index * slice_width, (ctx.height - slice_height) / 2, slice_width, 100);

      }

    }





    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 4, 0, 2 * Math.PI);
    ctx.fill();

    ctx.font = '20px "Arial"';
    ctx.fillStyle = 'white';
    ctx.fillText(~~elapsed, 600, 20);
    ctx.fillText(~~max_slices_len, 600, 40);

    window.requestAnimationFrame(draw_frame);
  })();


  window.addEventListener('mousemove', event => {
    const rect = ctx.canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  });
}
