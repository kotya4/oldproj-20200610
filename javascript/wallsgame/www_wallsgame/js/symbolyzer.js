//
var Symbolyzer = {};


Symbolyzer.create_charset = function(table) {
  const charset = [];

  const table_height = table.ctx.canvas.height;
  const table_width = table.ctx.canvas.width;

  const char_data = table.ctx.getImageData(0, 0, table_width, table_height);

  const char_height = table.char_height;
  const char_width = table.char_width;
  const rownum = table_height / char_height;
  const colnum = table_width / char_width;

  for (let chy = 0; chy < rownum; ++chy)
    for (let chx = 0; chx < colnum; ++chx)
  {
    const chox = chx * char_width;
    const choy = chy * char_height;

    const pixels = [];

    for (let py = 0; py < char_height; ++py)
      for (let px = 0; px < char_width; ++px)
    {
      const pox = chox + px;
      const poy = choy + py;

      const index = pox + poy * char_data.width;

      // tests alpha channel
      const a = char_data.data[3 + index * 4];

      if (a) {
        pixels.push(px | py << 4);
      }
    }

    charset.push(pixels.sort((a, b) => a - b));
  }

  return charset;
}


Symbolyzer.symbolize = function(table, charset, ctx, screen_x, screen_y, screen_width, screen_height, skip_from = Infinity) {
  const screen_data = ctx.getImageData(screen_x, screen_y, screen_width, screen_height);

  const char_height = table.char_height;
  const char_width = table.char_width;
  const rownum = screen_height / char_height;
  const colnum = screen_width / char_width;

  for (let chy = 0; chy < rownum; ++chy)
    for (let chx = 0; chx < colnum; ++chx)
  {
    const chox = chx * char_width;
    const choy = chy * char_height;

    const pixels = [];
    let text_color_R = 0;
    let text_color_G = 0;
    let text_color_B = 0;

    for (let py = 0; py < char_height; ++py)
      for (let px = 0; px < char_width; ++px)
    {
      const pox = chox + px;
      const poy = choy + py;

      const index = pox + poy * screen_data.width;

      // tests alpha channel
      const a = screen_data.data[3 + index * 4];

      if (a) {
        pixels.push(px | py << 4);
        text_color_R += screen_data.data[0 + index * 4];
        text_color_G += screen_data.data[1 + index * 4];
        text_color_B += screen_data.data[2 + index * 4];
      }
    }

    let ch_index = 0;
    let ch_collisions = -Infinity;

    for (let i = 0; i < charset.length; ++i) {
      if (charset[i].length > skip_from) continue;

      let collisions = -charset[i].length;

      for (let p of pixels) {
        collisions += Math.sign(charset[i].findIndex(e => e === p));
      }

      if (ch_collisions < collisions) {
        ch_collisions = collisions;
        ch_index = i;
      }
    }

    text_color_R = text_color_R / pixels.length | 0;
    text_color_G = text_color_G / pixels.length | 0;
    text_color_B = text_color_B / pixels.length | 0;
    const text_color = `rgb(${text_color_R}, ${text_color_G}, ${text_color_B})`;

    table.draw_char(ctx, ch_index, chox, choy, text_color);
  }
}


Symbolyzer.create_ascii_table = async function(src) {
  const img = new Image();
  img.src = src;

  await new Promise(r => img.onload = r);

  const char_height = img.height >> 4;
  const char_width = img.width >> 4;

  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = img.width;
  ctx.canvas.height = img.height;
  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(img, 0, 0);

  function draw_char(ctx, index, x, y, text_color, bg_color) {
    const char_x = index & 0xf;
    const char_y = index >> 4;

    // ctx.fillStyle = bg_color;
    // ctx.fillRect(x, y, char_width, char_height);

    ctx.drawImage(img, char_x * char_width, char_y * char_height,
                  char_width, char_height, x, y, char_width, char_height);
  }

  return {
    img,
    ctx,
    char_width,
    char_height,
    draw_char,
  }
}
