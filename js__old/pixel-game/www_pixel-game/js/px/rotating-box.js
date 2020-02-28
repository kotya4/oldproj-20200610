
px.RotatingBox = function(args = {}) {
  const arg = px.utils.create_argument_parser('px.RotatingBox', args);
  let angle = arg('angle', 0);
  const edges = arg('edges', 4);
  const scale = arg('scale', 20);
  const color = arg('color', 'white');
  const height = arg('height', 0.7);
  const origin = arg('origin', { x: 50, y: 50 });
  const rotation = arg('rotation', 1e-3);
  const radiuses = arg('radiuses', { x: 1.0, y: 0.2 });
  const rot_a = Math.PI * 2 / edges;
  let points = calc_points();

  function calc_points() {
    return [...Array(edges)].map((e,i) => {
      const rot = angle + rot_a * i;
      const x = radiuses.x * Math.cos(rot);
      const y = radiuses.y * Math.sin(rot);
      return { x, y };
    });
  }

  function rotate(e) {
    angle += rotation * e;
    points = calc_points();
  }

  function draw(ctx) {
    ctx.fillStyle = color;
    for (let i = 0; i < points.length; ++i) {
      const c = points[i]; // current
      const n = points[(i + 1) % points.length]; // next
      const x1 = origin.x + scale * n.x;
      const x2 = origin.x + scale * c.x;
      const y1 = origin.y + scale * n.y;
      const y2 = origin.y + scale * c.y;
      const hs = scale * height;
      px.utils.path.push(x1, y1 - hs);
      px.utils.path.push(x2, y2 - hs);
      px.utils.path.push(x2, y2 + hs);
      px.utils.path.push(x1, y1 + hs);
      px.utils.path.fill(ctx);
    }
  }
  
  this.rotate = rotate;
  this.draw = draw;
}

