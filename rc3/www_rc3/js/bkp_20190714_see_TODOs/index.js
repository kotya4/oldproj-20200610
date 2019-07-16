
window.onload = function () {


  const ctx = document.createElement('canvas').getContext('2d');
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


  /*
  function get_line_intersection(p0_x,  p0_y,  p1_x,  p1_y, p2_x,  p2_y,  p3_x,  p3_y) {
      const s1_x = p1_x - p0_x;
      const s1_y = p1_y - p0_y;
      const s2_x = p3_x - p2_x;
      const s2_y = p3_y - p2_y;
      const s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
      const t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);
      if (s >= 0 && s <= 1 && t >= 0 && t <= 1) return [p0_x + (t * s1_x), p0_y + (t * s1_y)];
      return null;
  }
  */


  const walls = [...Array(10)].map(e => Wall( ~~(Math.random() * ctx.canvas.width),
                                              ~~(Math.random() * ctx.canvas.height),
                                              ~~(Math.random() * ctx.canvas.width),
                                              ~~(Math.random() * ctx.canvas.height),
                                              { // texture information

                                                color: ~~(Math.random() * 0xffffff),
                                                transparent: false,

                                              }));


  const grid = Grid(walls, 50, [0, 0]);


  const raycaster = Raycaster();







  let last_timestamp = 0;
  (function drawFrame(timestamp) {
    const elapsed = timestamp - last_timestamp;
    last_timestamp = timestamp;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    grid.draw(ctx);

    for (let angle = 0; angle < Math.PI * 2; angle += 0.5) {

      const x0 = mouse.x / grid.size; // ray start position
      const y0 = mouse.y / grid.size;

      let x = x0; // changes over iterasions
      let y = y0;

      const cosa = Math.cos(angle); // deltas
      const sina = Math.sin(angle);


      const slices = []; // stack with all textures/distances (iterates backward when drew)


      // TODO: САНЧАЛАА ПРОВЕРИТЬ БЛОК НА КОТРОМ СТОИТ ИГРОК, ПОТОМ ПУСТИТЬ РЕИ


      for (let INF = 0xff; INF--; ) {


        const ray = raycaster.cast_ray(x, y, angle, grid);



        // ray goes to infinity
        if (ray.dist < 0) {



          break; // next angle
        }

        // REMOVE
        draw_circle(ray.hit[0] * grid.size, ray.hit[1] * grid.size, 2, 'red');
        draw_line(x * grid.size, y * grid.size, ray.hit[0] * grid.size, ray.hit[1] * grid.size, [
          'rgb(255, 0, 0)',
          'rgb(230, 0, 0)',
          'rgb(200, 0, 0)',
          'rgb(170, 0, 0)',
          'rgb(145, 0, 0)',
          'rgb(110, 0, 0)',
          'rgb( 90, 0, 0)',
          'rgb( 70, 0, 0)',
          'rgb( 50, 0, 0)',
          'rgb( 40, 0, 0)',
        ][INF % 10]);



        const block = grid.get(...ray.wall);


        // TODO: if block has own texture? do not need test for walls in it then
        // TODO: is block texture is transparent? if so, do not exit from loop


        // tests for nearest wall in block
        let nearest_dist = Infinity;
        let nearest_wall = null;
        let nearest_point = null;
        for (let w of block.walls) {

          const p = w.intersects(mouse.x, mouse.y, mouse.x + cosa * 1000, mouse.y + sina * 1000);
          if (!p) continue;


          if (p[0] < ray.wall[0] * grid.size || p[0] > (ray.wall[0] + 1) * grid.size
          ||  p[1] < ray.wall[1] * grid.size || p[1] > (ray.wall[1] + 1) * grid.size) continue;


          // REMOVE
          draw_circle(p[0], p[1], 2, 'lightgreen');


          const _x = p[0] - mouse.x;
          const _y = p[1] - mouse.y;
          const d = _x * _x + _y * _y;

          if (!nearest_wall || nearest_dist > d) {
            nearest_dist = d;
            nearest_wall = w;
            nearest_point = p;
          }
        }


        // TODO: неправильная логика транспарентности. сначала нужно проитерировать все найденные в блоке стены,
        // отмечая каждую ближайшую транспарентную стену как уже просмотренную, и уже потом, когда не останется
        // не просмотренных не транспарентных стен, пускать луч дальше по блокам.


        // wall was found
        if (nearest_wall) {

          // REMOVE
          draw_circle(nearest_point[0], nearest_point[1], 3, 'lightgreen');
          draw_line(ray.hit[0] * grid.size, ray.hit[1] * grid.size, nearest_point[0], nearest_point[1], 'lightgreen');

          // TODO: tex_x can be calculated by: mag("NEAR_P" - "WALL_CORNER (f.e. min(points))") / "WALL_LEN (precomputed)"

          // saves texture information and squared distance
          slices.push({
            tex: nearest_wall.tex,
            dist: nearest_dist,
          });


          // exit from loop only if wall is NOT transparent
          if (!nearest_wall.tex.transparent) break;
        }

        // slightly changing ray's start position to test next wall
        // and continues casting same ray.
        x = ray.hit[0] + cosa / 1000;
        y = ray.hit[1] + sina / 1000;
      }


      // draws wall


      // TODO: texture must to be scaled (walls, blocks, etc. - each has various size)


    }


    ctx.fillStyle = 'yellow';
    ctx.fillText('elapsed: ' + elapsed, 0, 20);


      /*
      const r = raycaster.cast_ray(ray.hit[0] + cosa / 1000, ray.hit[1] + sina / 1000, angle, grid);
      if (r.dist >= 0) {
        draw_line(ray.hit[0] * grid.size, ray.hit[1] * grid.size, r.hit[0] * grid.size, r.hit[1] * grid.size, 'red');
        draw_circle(r.hit[0] * grid.size, r.hit[1] * grid.size, 4, 'lightgreen');
      }
      */


      //draw_line(ray.next[0] * grid.size, ray.next[1] * grid.size, ray.hit[0] * grid.size, ray.hit[1] * grid.size, 'lightgreen');


    /*
    let dists = 0;
    let iters = 0;
    for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {

      let from_x = mouse.x;
      let from_y = mouse.y;
      for (let inf = 0xff; --inf; ) {

        const ray = cast_ray(angle, from_x, from_y);
        if (!ray.dist) break;
        //dists++;
        const x = ray.hit_x;
        const y = ray.hit_y;
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        let flag = false;

        for (let w of grid.get_walls(ray.hit_wall_x, ray.hit_wall_y)) {
          const inter = get_line_intersection(
            mouse.x, mouse.y,
            mouse.x + Math.cos(angle) * 10000, mouse.y + Math.sin(angle) * 10000,
            ...w.points[0].position,
            ...w.points[1].position);
          if (inter) {
            iters++;
            ctx.strokeStyle = 'lightgreen';
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(...inter);
            ctx.stroke();
            flag = true;
          }
        }

        //break;

        // интерсекия нашлась, нужно выйти из инфинит лупа
        if (flag) break;

        // интерсекция не нашлась, продолжаем искать со следующего вола
        from_x = ray.next_wall_x;
        from_y = ray.next_wall_y;

        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(ray.hit_x, ray.hit_y, 4, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(ray.next_wall_x, ray.next_wall_y, 4, 0, 2 * Math.PI);
        ctx.fill();

        //console.log(ray);
        //throw Error();
      }

    }
    */


    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 4, 0, 2 * Math.PI);
    ctx.fill();

    //ctx.fillText('dists: ' + dists, 600, 20);
    //ctx.fillText('iters: ' + iters, 600, 40);

    window.requestAnimationFrame(drawFrame);
  })();


  /*
  const line = Line(Point(10, 20), Point(100, 150));


  const quad = {
    position: [30, 30],
    size: 50,
    draw(ctx) { ctx.fillRect(...this.position, this.size, this.size); },
  };



  (function drawFrame(timestamp) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 4, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = 'white';

    quad.draw(ctx);
    line.draw(ctx);
    line.points[0].position[0] = mouse.x;
    line.points[0].position[1] = mouse.y;

    let intersects = false;





    ctx.fillText(intersects, 100, 100);

    window.requestAnimationFrame(drawFrame);
  })();
  */

  window.addEventListener('mousemove', event => {
    const rect = ctx.canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  });
}
