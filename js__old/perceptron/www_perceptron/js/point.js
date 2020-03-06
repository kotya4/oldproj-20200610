
function Point({ x, y, width, height, radius }) {
  if (undefined === x)
    if (undefined === width)
      throw Error('argument "width" not passed');
    else
      x = Math.random() * width | 0;
  
  if (undefined === y)
    if (undefined === height)
      throw Error('argument "height" not passed');
    else
      y = Math.random() * height | 0;

  if (undefined === radius) radius = 4;

  const label = x > y ? +1 : -1;


  function draw_on(ctx, guess_label = label) {
    ctx.strokeStyle = guess_label > 0 ? 'blue' : 'green';
    ctx.beginPath();
    ctx.ellipse(x - (radius >> 1), y - (radius >> 1), radius, radius, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (guess_label !== label) {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.ellipse(x - (radius >> 1), y - (radius >> 1), radius >> 1, radius >> 1, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }


  this.draw_on = draw_on;
  this.label = label;
  this.x = x;
  this.y = y;
}