window.onload = function() {


  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.height = 300;
  ctx.canvas.width = 300;
  document.body.appendChild(ctx.canvas);

  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const colors = Array(50).fill().map(_ => Array(3).fill().map(_ => Math.random() * 256 | 0));
  let color_index = 0;

  function divide_rect(out, rect, min_size = 0, depth = 0xffff) {
    if (!(out instanceof Array)) throw Error('First argument must be array');

    if (--depth <= 0) {
      out.push(rect);
      return out;
    }

    const w = rect[2];
    const h = rect[3];


    let new_rect_1, new_rect_2;
    let scaler, offset;
    const choosen_side = Math.random() < 0.5;

    if (choosen_side) { // width
      scaler = w - min_size * 2;
      if (scaler <= 0) {
        out.push(rect);
        return;
      }
      offset = min_size + Math.random() * scaler | 0;
      new_rect_1 = [rect[0]         , rect[1], offset, rect[3]];
      new_rect_2 = [rect[0] + offset, rect[1], rect[2] - offset, rect[3]];
    } else { // height
      scaler = h - min_size * 2;
      if (scaler <= 0) {
        out.push(rect);
        return;
      }
      offset = min_size + Math.random() * scaler;
      new_rect_1 = [rect[0], rect[1]         , rect[2], offset];
      new_rect_2 = [rect[0], rect[1] + offset, rect[2], rect[3] - offset];
    }

    divide_rect(out, new_rect_1, min_size, depth);
    divide_rect(out, new_rect_2, min_size, depth);
  }

  function draw_rect(r) {
    ctx.fillStyle = `rgb(${colors[color_index]})`;
    ctx.fillRect(r[0], r[1], r[2], r[3]);
    color_index = (color_index + 1) % colors.length;
  }


  const rects = [];
  divide_rect(rects, [0, 0, 300, 300], 30);


  console.log(rects);

  //ctx.translate(150, 150);
  for (let rect of rects) {
    draw_rect(rect);
  }

}