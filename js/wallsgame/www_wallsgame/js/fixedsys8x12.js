//
async function Fixedsys8x12(buffer_width, buffer_height) {
  // prepares font from base64/path source
  async function prepare_from_source(src) {
    // creates image from source
    const img = new Image();
    img.src = src;
    await new Promise(r => img.onload = r);
    // creates buffer context with fixedsys image
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.canvas.height = img.height;
    ctx.canvas.width = img.width;
    ctx.drawImage(img, 0, 0);
    // returns info
    return {
      img,
      ctx,
      char_width: 8,
      char_height: 12,
      draw_char(ctx, char_index, screen_x, screen_y) {
        const char_x = char_index & 15;
        const char_y = char_index >> 4;
        ctx.drawImage(this.img, char_x * this.char_width, char_y * this.char_height, this.char_width,
                      this.char_height, screen_x, screen_y, this.char_width, this.char_height);
      },
    };
  }

  // prepares symbol-matrix screen buffer
  function prepare_buffer(font, width, height) {
    // screen buffer
    const buffer = Array(width * height).fill().map(_ => ({
      textcolor: 'white',
      backcolor: 'black',
      char_index: 0,
    }));
    // screen buffer instance
    return {
      font,
      width,
      height,
      buffer,
      clear() {
        for (let o of this.buffer)
          o.char_index = 0;
      },
      get(x, y) {
        return this.buffer[x + y * this.width];
      },
      flush(ctx, screen_x = 0, screen_y = 0) {
        for (let i = 0; i < this.buffer.length; ++i) {
          const x = (i % this.width    ) * this.font.char_width  + screen_x;
          const y = (i / this.width | 0) * this.font.char_height + screen_y;
          // TODO: implement colors
          this.font.draw_char(ctx, this.buffer[i].char_index, x, y);
        }
      },
    };
  }


  function prepare_line_drawer() {

    const horisontal = [['_'], [',', '.'], ['-', '~'], ["'", '"'], ['`']];
    const vertical = [['/'], ['|', '!',';', ':'], ['\\']];

  }


  // creates font instance
  const font = await prepare_from_source(Fixedsys8x12.base64);
  // creates screen buffer instance
  const screen = prepare_buffer(font, buffer_width, buffer_height);



  return { font, screen };
}


// original fixedsys8x12 black/transparent 16x16 (256) characters image
Fixedsys8x12.base64 = '\
data:image/png;base64,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\
79+DL8NwBM6Dl3I1lPbAAAAABJRU5ErkJggg==';
