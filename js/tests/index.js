window.onload = function() {


  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.height = 600;
  ctx.canvas.width = 600;
  document.body.appendChild(ctx.canvas);

  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const colors = Array(50).fill().map(_ => Array(3).fill().map(_ => Math.random() * 256 | 0));
  let color_index = 0;

  function divide_rect(out, rect, rsize, depth = 0xffff, name = '') {
    if (!(out instanceof Array)) throw Error('First argument must be array');

    if (--depth <= 0) {
      out.push(rect);
      rect.name = name;
      return out;
    }

    const w = rect[2];
    const h = rect[3];


    let rect_1, rect_2, choosen_side;
    const scalerw = w - rsize[0] * 2;
    const scalerh = h - rsize[1] * 2;

    if (scalerw > 0 && scalerh > 0) {
      choosen_side = Math.random() < 0.5;
    } else if (scalerw > 0) {
      choosen_side = true;
    } else if (scalerh > 0) {
      choosen_side = false;
    } else {
      out.push(rect);
      rect.name = name;
      return;
    }

    if (choosen_side) { // width
      const offset = rsize[0] + Math.random() * scalerw | 0;
      rect_1 = [rect[0]         , rect[1], offset, rect[3]];
      rect_2 = [rect[0] + offset, rect[1], rect[2] - offset, rect[3]];
    } else { // height
      const offset = rsize[1] + Math.random() * scalerh;
      rect_1 = [rect[0], rect[1]         , rect[2], offset];
      rect_2 = [rect[0], rect[1] + offset, rect[2], rect[3] - offset];
    }

    divide_rect(out, rect_1, rsize, depth, name + ['T', 'L'][+choosen_side]);
    divide_rect(out, rect_2, rsize, depth, name + ['B', 'R'][+choosen_side]);
  }

  let i = 0;
  function draw_rect(r) {
    ctx.fillStyle = `rgb(${colors[color_index]})`;
    ctx.fillRect(r[0], r[1], r[2], r[3]);
    ctx.fillStyle = 'black';
    ctx.fillText(`${i} ${r.name}`, r[0] + 5, r[1] + 20);
    color_index = (color_index + 1) % colors.length;
    ++i;
  }


  const rects = [];
  divide_rect(rects, [0, 0, ctx.canvas.width, ctx.canvas.height], [80, 80]);


  console.log(rects);

  //ctx.translate(150, 150);
  for (let rect of rects) {
    draw_rect(rect);
  }

}