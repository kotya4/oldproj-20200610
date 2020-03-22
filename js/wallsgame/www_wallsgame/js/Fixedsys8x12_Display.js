//
function Fixedsys8x12_Display(WIDTH, HEIGHT) {
  // Drawn if coords out of buffer range.
  const ERR_BUFFER_OBJECT = { foreground: 'white', background: 'black', char_index: 0 };
  // One character size in pixels.
  const CHAR_HEIGHT = 12;
  const CHAR_WIDTH = 8;
  // see 'random()'
  let RANDOM_SET = Array(43).fill().map(Math.random);
  let RANDOM_SET_INDEX = 0;
  // How many lines was drawn on flush.
  let LINES_DRAWN = 0;
  // Base 64 image of character table (16x16 ch.)x(8x12 px.).
  const table_img = new Image();
  table_img.src = Fixedsys8x12_Display.base64;
  const promise = new Promise(r => table_img.onload = r);
  // Screen buffer.
  const buffer = Array(WIDTH * HEIGHT).fill().map(_ => ({
    foreground: 'white',
    background: 'black',
    char_index: 0,
  }));


  // Output.
  return {
    // Constants.
    ERR_BUFFER_OBJECT,
    CHAR_HEIGHT,
    CHAR_WIDTH,
    HEIGHT,
    WIDTH,
    table_img,
    promise,
    buffer,
    // Getters.
    lines_drawn() { return LINES_DRAWN; },
    // Functions.
    clear,
    flush,
    stroke,
    random,
    random_charcode,
    get_buffer_object,
  };


  // Seeded pseudorandom.
  function random() {
    return RANDOM_SET[(RANDOM_SET_INDEX<<3)%RANDOM_SET.length];
  }


  // Returns random charcode from string.
  function random_charcode(s) {
    return s.charCodeAt(random() * s.length | 0);
  }


  // Clears buffer.
  function clear() {
    LINES_DRAWN = 0;
    for (let o of buffer) o.char_index = 0;
  }


  // Returns buffer object.
  function get_buffer_object(x, y) {
    if (x >= WIDTH || y >= HEIGHT || x < 0 || y < 0) return ERR_BUFFER_OBJECT;
    return buffer[x + y * WIDTH] || ERR_BUFFER_OBJECT;
  }


  // Draws buffer into canvas.
  function flush(ctx, offset_x = 0, offset_y = 0) {
    for (let i = 0; i < buffer.length; ++i) {
      const x = offset_x + (i % WIDTH    ) * CHAR_WIDTH;
      const y = offset_y + (i / WIDTH | 0) * CHAR_HEIGHT;
      // Draws character from buffer object.
      // TODO: implement colors
      const { char_index } = buffer[i];
      const char_x = char_index & 15; // 16x16 table
      const char_y = char_index >> 4;
      ctx.drawImage(table_img, char_x * CHAR_WIDTH, char_y * CHAR_HEIGHT, CHAR_WIDTH,
                    CHAR_HEIGHT, x, y, CHAR_WIDTH, CHAR_HEIGHT);
    }
  }


  // Draws line in buffer.
  function stroke(x1, y1, x2, y2, overlap = false) {
    // source: https://en.wikipedia.org/wiki/Digital_differential_analyzer_(graphics_algorithm)
    x1 /= CHAR_WIDTH, y1 /= CHAR_HEIGHT;
    x2 /= CHAR_WIDTH, y2 /= CHAR_HEIGHT;
    x1 = (~~x1) + 0.5;
    y1 = (~~y1) + 0.5;
    x2 = (~~x2) + 0.5;
    y2 = (~~y2) + 0.5;
    let dx = x2 - x1;
    let dy = y2 - y1;
    const step = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);
    dx /= step;
    dy /= step;
    const abdx = Math.abs(dx);
    const abdy = Math.abs(dy);
    const SLASH = '\\/'[dy * dx < 0 | 0];
    // Strokes.
    for (let i = 0; i < step; ++i) {
      RANDOM_SET_INDEX = i; // see 'random()'
      const x = ~~x1;
      const y = ~~y1;
      const px = x1 - x;
      const py = y1 - y;
      x1 += dx;
      y1 += dy;
      // Buffer contains charxels (pixel as character).
      const charxel = get_buffer_object(x, y);
      // Overlapped chars displayed as 'x'.
      if (!overlap && charxel.char_index !== 0)
        charxel.char_index = random_charcode('x');
      // Vertical char.
      else if (abdx !== 1)
        charxel.char_index = random_charcode(px < abdx ? (random() < (abdx - 0.5) ? SLASH : ';:') : '|');
      // Horisontal char.
      else if (abdy <= 0.35)
        charxel.char_index = ['`', `'"`, '-', '.,', '_'].map(random_charcode)[py * 5 | 0];
      // Diagonal char.
      else if (abdy <= 0.66)
        charxel.char_index = [`\`'"`, SLASH, '.,'].map(random_charcode)[py * 3 | 0];
      // Other.
      else {
        if      (py < 0.10) charxel.char_index = random_charcode('`');
        else if (py < 0.33) charxel.char_index = random_charcode(`'"`);
        else if (py < 0.80) charxel.char_index = random_charcode(SLASH);
        else                charxel.char_index = random_charcode('.,');
      }
    }
    // Returs number stroked of lines.
    return ++LINES_DRAWN;
  }
}


// Runs quick demo.
Fixedsys8x12_Display.demo = async function () {
  const display_height = 300;
  const display_width = 300;
  // Canvas.
  const ctx = document.createElement('canvas').getContext('2d');
  document.body.appendChild(ctx.canvas);
  ctx.canvas.height = display_height;
  ctx.canvas.width = display_width;
  ctx.imageSmoothingEnabled = false;
  // Current Time.
  const milliseconds = () => Date.now();
  const seconds = () => (Date.now() / 1000 | 0) % 60;
  const minutes = () => (Date.now() / 1000 | 0) / 60 % 60;
  const hours   = () => (Date.now() / 1000 | 0) / 60 / 60 + 3; // UTC + 3
  // Clock image properties.
  const millisecondArrowRadius = 120;
  const secondArrowRadius = 100;
  const minuteArrowRadius = 75;
  const hourArrowRadius = 50;
  const clockfaceRadius = 120;
  const bgRadius = 145;
  const origin = [150, 150];

  // Initiating.
  const fixedsys = Fixedsys8x12_Display(40, 40);

  // Render Loop.
  setInterval(() => {
    // Clear canvas.
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Clear terminal buffer.
    fixedsys.clear();

    const millisecondsArrowAngle = -Math.PI / 2 + milliseconds() * Math.PI * 2 / 1000;
    const secondArrowAngle = -Math.PI / 2 + seconds() * Math.PI * 2 / 60;
    const minuteArrowAngle = -Math.PI / 2 + minutes() * Math.PI * 2 / 60;
    const hourArrowAngle   = -Math.PI / 2 + hours()   * Math.PI * 2 / 12;

    // Creates lines (draws on buffer, not in canvas!).

    fixedsys.stroke(
      ...origin,
      origin[0] + Math.cos(millisecondsArrowAngle) * millisecondArrowRadius,
      origin[1] + Math.sin(millisecondsArrowAngle) * millisecondArrowRadius, false);

    fixedsys.stroke(
      ...origin,
      origin[0] + Math.cos(secondArrowAngle) * secondArrowRadius,
      origin[1] + Math.sin(secondArrowAngle) * secondArrowRadius, false);

    fixedsys.stroke(
      ...origin,
      origin[0] + Math.cos(minuteArrowAngle) * minuteArrowRadius,
      origin[1] + Math.sin(minuteArrowAngle) * minuteArrowRadius, false);

    fixedsys.stroke(
      ...origin,
      origin[0] + Math.cos(hourArrowAngle) * hourArrowRadius,
      origin[1] + Math.sin(hourArrowAngle) * hourArrowRadius, false);

    for (let t = 0; t < 12; ++t) {
      const angle = -Math.PI / 2 + t * Math.PI * 2 / 12;
      const x = (origin[0] + Math.cos(angle) * clockfaceRadius) / fixedsys.CHAR_WIDTH  | 0;
      const y = (origin[1] + Math.sin(angle) * clockfaceRadius) / fixedsys.CHAR_HEIGHT | 0;
      if (t < 10 && t > 0) {
        fixedsys.get_buffer_object(x, y).char_index = t + 48;
      } else {
        fixedsys.get_buffer_object(x - 1, y).char_index = 49;
        fixedsys.get_buffer_object(x, y).char_index = t === 0 ? 50 : t % 10 + 48;
      }
    }

    for (let y = 0; y < fixedsys.HEIGHT; ++y)
      for (let x = 0; x < fixedsys.WIDTH; ++x)
    {
      const rx = (x / 0.95) * fixedsys.CHAR_WIDTH  - origin[0];
      const ry = (y / 0.95) * fixedsys.CHAR_HEIGHT - origin[1];
      if (rx ** 2 + ry ** 2 > bgRadius ** 2) {
        fixedsys.get_buffer_object(x, y).char_index = Math.random() * 256 | 0;
      }
    }

    // Draws buffer into canvas.
    fixedsys.flush(ctx);

    ctx.save();
    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }, 10);

}


// original fixedsys8x12 black/transparent 16x16 (256) characters image
Fixedsys8x12_Display.base64 = '\
data:image/png;base64,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\
79+DL8NwBM6Dl3I1lPbAAAAABJRU5ErkJggg==';
