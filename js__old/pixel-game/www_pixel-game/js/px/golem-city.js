
px.GolemCity = function(args = {}) {
  const arg = px.utils.create_argument_parser('px.GolemCity', args);
  const depth = arg('depth', 3);
  const sizes = arg('sizes', [5, 15, 10, 50]);
  const spread = arg('spread', 200);
  const center = arg('center', [100, 100]);
  const boundaries = arg('boundaries'); // array with cvs.width and cvs.height
  const builds_count = arg('builds_count', 30);
  const builds = create_builds(builds_count);
  const canvas = create_canvas(builds);

  function create_builds(count) {
    return [...Array(count)].map(() => {
      const w = sizes[0] + Math.pow(Math.random(), 2) * sizes[1] | 0;
      const h = sizes[2] + Math.pow(Math.random(), 2) * sizes[3] | 0;

      let x, y, z;
      {
        const s = spread - h; //Math.pow(spread / h, 2);
        x = center[0] - s / 2 + px.utils.rand(s);
        y = center[1];
        z = depth;
      }
      
      let color_front, color_side, color_top;
      {
        const r = px.utils.rand(10, 30);
        const g = r + px.utils.rand(5);
        const b = r + px.utils.rand(5);
        color_front = `rgb(${r},${g},${b})`;
        color_side = `rgb(${r * 2},${g * 2},${b * 2})`;
        color_top = `rgb(${r / 2},${g / 2},${b / 2})`;
      }

      function draw(ctx) {
        ctx.fillStyle = color_front;
        ctx.fillRect(x, y, w, -h);

        ctx.fillStyle = color_side;
        ctx.fillRect(x - z, y, z, -h - z);
        
        ctx.fillStyle = color_top;
        ctx.beginPath();
        ctx.moveTo(x, y - h);
        ctx.lineTo(x + w, y - h);
        ctx.lineTo(x - z + w, y - h - z);
        ctx.lineTo(x - z, y - h - z);
        ctx.fill();

        for (let _x = 1; _x < w - 1; _x += 2) {
          for (let _y = 1; _y < h - 1; _y += 2) {
            const r = px.utils.rand(150);
            const g = r;
            const b = px.utils.rand(100);
            ctx.fillStyle = `rgb(${r},${r},${b})`;
            ctx.fillRect(x + _x | 0, y - _y | 0, 1, 1);
          }
        }
      }

      return { h, draw };
    });
  }

  function create_canvas(builds) {
    const cvs = document.createElement('canvas');
    cvs.width = boundaries[0];
    cvs.height = boundaries[1];
    const ctx = cvs.getContext('2d');
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    builds.sort((a,b) => { return b.h - a.h; }).forEach(e => { e.draw(ctx); });
    return cvs;
  }

  function draw(ctx) { ctx.drawImage(canvas, 0, 0); }

  this.draw = draw;
}

