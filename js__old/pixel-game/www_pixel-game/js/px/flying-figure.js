
px.FlyingFigure = function(args = {}) {
  const arg = px.utils.create_argument_parser('px.FlyingFigure', args);
  const box = arg('boundaries', [5, 100, 50, 50]); // x, y, w, h
  const acc = arg('acceleration', 0.01);
  let points = arg('points', null);
  if (!points) {
    const points_count = arg('points_count', 4);
    points = create_points(points_count);
  }

  function create_points(count) {
    return [...Array(count)].map(e => {
      const pos = {
        x: box[0] + px.utils.rand(box[2]),
        y: box[1] + px.utils.rand(box[3]),
      };
      const spd = {
        x: (acc + px.utils.rand() * acc) * [-1, +1][px.utils.rand(2)],
        y: (acc + px.utils.rand() * acc) * [-1, +1][px.utils.rand(2)],
      };
      return { pos, spd };
    });
  }

  function proc(elapsed) {
    points.forEach(e => {
      if (e.pos.x < box[0] || e.pos.x > box[0] + box[2])
        e.spd.x = -e.spd.x;
      
      if (e.pos.y < box[1] || e.pos.y > box[1] + box[3])
        e.spd.y = -e.spd.y;

      e.pos.x += e.spd.x * elapsed;
      e.pos.y += e.spd.y * elapsed;
    });
  }

  function draw(ctx) {
    for (let i = 0; i < points.length - 1; ++i) {
      const p1 = points[i];
      for (let k = i + 1; k < points.length; ++k) {
        const p2 = points[k];
        px.utils.path.push(p1.pos.x, p1.pos.y);
        px.utils.path.push(p2.pos.x, p2.pos.y);
        px.utils.path.fill(ctx);
      }
    }
  }

  this.proc = proc;
  this.draw = draw;
}
