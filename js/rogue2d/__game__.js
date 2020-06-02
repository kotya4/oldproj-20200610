const __game__ = Object.freeze({

  block_size_px: 30,

  to_block(v) {
    return v / this.block_size_px;
  },

  to_pixel(v) {
    return v * this.block_size_px;
  },

  pos_to_block(x, y) {
    return {
      x: this.to_block(x),
      y: this.to_block(y),
    }
  },

  pos_to_pixel(x, y) {
    return {
      x: this.to_pixel(x),
      y: this.to_pixel(y),
    }
  },

  arr_to_block(a) {
    return a.map(v => this.to_block(v));
  },

  arr_to_pixel(a) {
    return a.map(v => this.to_pixel(v));
  },

});
