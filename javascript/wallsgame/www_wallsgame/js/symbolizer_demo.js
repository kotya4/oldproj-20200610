
window.onload = async () => {
  const display_height = 300;
  const display_width = 640;

  const ctx = document.createElement('canvas').getContext('2d');
  document.body.appendChild(ctx.canvas);
  ctx.canvas.height = display_height + 192;
  ctx.canvas.width = display_width + 100;
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = 'black';
  //ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // ctx.fillStyle = 'white';
  ctx.clearRect(0, 0, display_width, display_height);


  const ascii_img = new Image();
  ascii_img.src = BASE64__ascii;
  await new Promise(r => ascii_img.onload = r);

  const char_height = ascii_img.height >> 4;
  const char_width = ascii_img.width >> 4;
  const rownum = display_height / char_height;
  const colnum = display_width / char_width;

  function draw_char(index, display_x, display_y) {
    const x = index & 0xf;
    const y = index >> 4;
    ctx.drawImage(ascii_img, x * char_width, y * char_height, char_width, char_height,
                  display_x, display_y, char_width, char_height);
  }

  // for (let y = 0; y < rownum; ++y)
  //   for (let x = 0; x < colnum; ++x)
  // {
  //   const rgb = ['100, 100, 100', '200, 200, 200'][(x + y) % 2];
  //   ctx.fillStyle = `rgba(${rgb}, 0.5)`;
  //   ctx.fillRect(x * char_width, y * char_height, char_width, char_height);
  // }




  // draw random lines
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  for (let i = 0; i < 50; ++i) {

    const points_x = [0, 0].map(_ => Math.random() * display_width);
    const points_y = [0, 0].map(_ => Math.random() * display_height);

    ctx.beginPath();
    ctx.moveTo(points_x[0], points_y[0]);
    ctx.lineTo(points_x[1], points_y[1]);
    ctx.stroke();
  }


  // first character place will be occupied for draing all characters to test

  ctx.fillStyle = 'white';
  // character printed on real display, in these positions:
  const chartable_x = 0;
  const chartable_y = char_height * rownum;

  ctx.clearRect(chartable_x, chartable_y, ascii_img.width, ascii_img.height);
  ctx.drawImage(ascii_img, chartable_x, chartable_y);




  function compare_chunks(data1, chunk1_x, chunk1_y, data2, chunk2_x, chunk2_y) {
    let coins = 0;
    for (let y = 0; y < char_height; ++y)
      for (let x = 0; x < char_width; ++x)
    {
      const p1x = chunk1_x * char_width + x;
      const p1y = chunk1_y * char_height + y;
      const A1 = data1.data[(p1x + p1y * data1.width) * 4 + 3];

      const p2x = chunk2_x * char_width + x;
      const p2y = chunk2_y * char_height + y;
      const A2 = data2.data[(p2x + p2y * data2.width) * 4 + 3];

      if (!!A1 === !!A2) ++coins; else --coins;
    }
    return coins;
  }



  // const ch_ctx = document.createElement('canvas').getContext('2d');
  // ch_ctx.canvas.width = 8 * 10;
  // ch_ctx.canvas.height = 12;
  // ch_ctx.imageSmoothingEnabled = false;







  const display_data = ctx.getImageData(0, 0, display_width, display_height);
  const char_data = ctx.getImageData(chartable_x, chartable_y, ascii_img.width, ascii_img.height);





  // const winner_chars = [...Array(rownum * colnum)];

  // console.time('time');

  // for (let y = 0; y < rownum; ++y)
  //   for (let x = 0; x < colnum; ++x)
  // {
  //   let winner_coins = -1;
  //   let winner_index = -1;

  //   for (let chy = 0; chy < 16; ++chy)
  //     for (let chx = 0; chx < 16; ++chx)
  //   {
  //     const current_coins = compare_chunks(display_data, x, y, char_data, chx, chy);
  //     const current_index = chx + chy * 16;

  //     if (winner_index < 0 || current_coins > winner_coins) {
  //       winner_index = current_index;
  //       winner_coins = current_coins;
  //     }
  //   }

  //   winner_chars[x + y * colnum] = { index: winner_index, coins: winner_coins };

  // }

  // console.timeEnd('time');

  // // console.log(winner_chars);


  // for (let y = 0; y < rownum; ++y)
  //   for (let x = 0; x < colnum; ++x)
  // {
  //   ctx.fillStyle = '#aaa';
  //   ctx.fillRect(x * char_width, y * char_height, char_width, char_height);
  //   draw_char(winner_chars[x + y * colnum].index, x * char_width, y * char_height);
  // }








  // function quadtree_mask(point, depth) {
  //   // 00b -- Left Top
  //   // 01b -- Right Top
  //   // 10b -- Left Bottom
  //   // 11b -- Right Bottom
  //   let mask = 0;

  //   let rect_width  = 8;
  //   let rect_height = 12;

  //   let rect_x = 0;
  //   let rect_y = 0;

  //   for (let i = 0; i < depth; ++i) {
  //     rect_width /= 2;
  //     rect_height /= 2;

  //     if (point[1] >= rect_y + rect_height) {
  //       mask |= 1 << 1 + i * 2;
  //       rect_y += rect_height;
  //     }

  //     if (point[0] >= rect_x + rect_width) {
  //       mask |= 1 << 0 + i * 2;
  //       rect_x += rect_width;
  //     }
  //   }

  //   return mask;
  // }

  const charset = [];

  for (let chy = 0; chy < 16; ++chy)
    for (let chx = 0; chx < 16; ++chx)
  {
    const chox = chx * 8;
    const choy = chy * 12;

    const pixels = [];

    for (let py = 0; py < 12; ++py)
      for (let px = 0; px < 8; ++px)
    {
      const pox = chox + px;
      const poy = choy + py;

      const index = pox + poy * char_data.width;

      const a = char_data.data[3 + index * 4];

      if (a) {
        pixels.push(px | py << 4);
      }
    }

    charset.push(pixels.sort((a, b) => a - b));
  }







  console.time('time2');

  for (let chy = 0; chy < 25; ++chy)
    for (let chx = 0; chx < 80; ++chx)
  {
    const chox = chx * 8;
    const choy = chy * 12;

    const pixels = [];

    for (let py = 0; py < 12; ++py)
      for (let px = 0; px < 8; ++px)
    {
      const pox = chox + px;
      const poy = choy + py;

      const index = pox + poy * display_data.width;

      const a = display_data.data[3 + index * 4];

      if (a) {
        pixels.push(px | py << 4);
      }
    }

    let ch_index = 0;
    let ch_collisions = -Infinity;

    for (let i = 0; i < charset.length; ++i) {
      if (charset[i].length > 25) continue;

      let collisions = -charset[i].length;

      for (let p of pixels) {
        if (charset[i].findIndex(e => e === p) > -1) {
          ++collisions;
        } else {
          --collisions;
        }
      }

      if (ch_collisions < collisions) {
        ch_collisions = collisions;
        ch_index = i;
      }
    }

    ctx.fillStyle = '#aaa';
    ctx.fillRect(chox, choy, char_width, char_height);
    draw_char(ch_index, chox, choy);
  }





  console.timeEnd('time2');







}
