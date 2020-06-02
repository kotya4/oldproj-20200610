function Player(opt = {}) {
  const { sprites, position } = opt;
  if (!sprites) throw Error(`Player: no 'sprites' as option passed`);
  if (!position) throw Error(`Player: no 'position' as option passed`);

  // REMOVE (use 'sprites' instead)
  const img = new Image();
  img.src = __data__.balloon_cat;
  const tile = {
    // pointer to a tileset
    img,
    // collision box (crops __game__.block_to_px)
    box: { left: -0.2, right: -0.2, top: -0.2, bottom: -0.2 },
    // size of tile (cropped image)
    size: { width: 40, height: 37 },
    // scales drawed image
    scale: { width: 2, height: 2 },
  };

  // creature
  const creature = {
    x: position.x,
    y: position.y,

    draw(ctx) {
      // image
      const img_pos = __game__.pos_to_pixel(this.x, this.y);

      ctx.drawImage(tile.img,
        tile.size.width * 0, tile.size.height * 0,
        tile.size.width, tile.size.height,
        img_pos.x - (tile.size.width * tile.scale.width) / 2, img_pos.y - (tile.size.height * tile.scale.height),
        tile.size.width * tile.scale.width, tile.size.height * tile.scale.height);

      // REMOVE

      __debug.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      __debug.ctx.fillRect(img_pos.x - tile.size.width / 2, img_pos.y - tile.size.height, tile.size.width, tile.size.height);

      // collision box
      const box_pos = __game__.pos_to_pixel(this.x - 0.5 + tile.box.left, this.y - tile.box.bottom - (1 - tile.box.top - tile.box.bottom));
      const box_size = __game__.pos_to_pixel(1 - tile.box.left - tile.box.right, 1 - tile.box.top - tile.box.bottom);
      __debug.ctx.fillStyle = 'rgba(0, 0, 255, 0.7)';
      __debug.ctx.fillRect(box_pos.x, box_pos.y, box_size.x, box_size.y);
    },


    move(map, elapsed, side) {
      if (side === 'left') {
        this.x -= elapsed * 0.01;
      }

      if (side === 'right') {
        this.x += elapsed * 0.01;
      }

      if (side === 'up') {
        this.y -= elapsed * 0.01;
      }

      if (side === 'down') {
        this.y += elapsed * 0.01;
      }

      // TODO: static block has immutable discrete position,  so
      //       any 'crashes' calculates only for creatures. also
      //       blocks  (static objects)  has  infinity  weights.
      //       it  will  be  cool to add non-static objects like
      //       moving platforms.    lighter objects have to move
      //       with platforms,  and heavier ones stand still and
      //       fall when platform goes from underneath it.

      this.crash(map, side);
    },



    crash(map, side) {

      // TODO: block  can to be replaced with any non-static object,
      //       only needs width,  height and precalculted sides like
      //       this.    also objects can have different weights, and
      //       based on their weights they can move each other (f.e.
      //       lighter  object  will be moved by heavier and so on).

      const block_x_left = ~~(this.x - 0.5 + tile.box.left);
      const block_x_right = ~~(this.x + 0.5 - tile.box.right);
      const block_y_top = ~~(this.y - 1.0 + tile.box.top);
      const block_y_bottom = ~~(this.y + 0.0 - tile.box.bottom);
      const eps = 1e-6; // HACK: tl;dr normalized block size NOT contain supremum and infimum

      // REMOVE
      __debug.ctx.fillStyle = 'rgba(0, 250, 250, 0.2)';
      const plt = __game__.pos_to_pixel(block_x_left, block_y_top);
      const prt = __game__.pos_to_pixel(block_x_right, block_y_top);
      const plb = __game__.pos_to_pixel(block_x_left, block_y_bottom);
      const prb = __game__.pos_to_pixel(block_x_right, block_y_bottom);
      __debug.ctx.fillRect(plt.x, plt.y, __game__.block_size_px - 1, __game__.block_size_px - 1);
      __debug.ctx.fillRect(prt.x, prt.y, __game__.block_size_px - 1, __game__.block_size_px - 1);
      __debug.ctx.fillRect(plb.x, plb.y, __game__.block_size_px - 1, __game__.block_size_px - 1);
      __debug.ctx.fillRect(prb.x, prb.y, __game__.block_size_px - 1, __game__.block_size_px - 1);

      if (side === 'left') {
        for (let y = block_y_top; y <= block_y_bottom; ++y) {
          if (map.solid(block_x_left, y)) {
            this.x = block_x_left + 1 + 0.5 - tile.box.left + eps;
            return true;
          }
        }
      }

      if (side === 'right') {
        for (let y = block_y_top; y <= block_y_bottom; ++y) {
          if (map.solid(block_x_right, y)) {
            this.x = block_x_right + 0 - 0.5 + tile.box.right - eps;
            return true;
          }
        }
      }

      if (side === 'up') {
        for (let x = block_x_left; x <= block_x_right; ++x) {
          if (map.solid(x, block_y_top)) {
            this.y = block_y_top + 1 + 1.0 - tile.box.top + eps;
            return true;
          }
        }
      }

      if (side === 'down') {
        for (let x = block_x_left; x <= block_x_right; ++x) {
          if (map.solid(x, block_y_bottom)) {
            this.y = block_y_bottom + 0 - 0.0 + tile.box.bottom - eps;
            return true;
          }
        }
      }

      return false;
    },



    // REMOVE: function deprecated (see 'crash')
    fall(map, elapsed) {
      const dy = elapsed * 0.01;
      const block_y_offset = (this.y - tile.box.bottom) % 1;
      const block_y_bottom = Math.ceil(this.y - tile.box.bottom);
      const block_x_left = ~~(this.x - 0.5 + tile.box.left);
      const block_x_right = ~~(this.x + 0.5 - tile.box.right);

      // if at least one block below is solid, then it is solid
      let solid_below = false;
      for (let x = block_x_left; x <= block_x_right; ++x)
        solid_below |= map.solid(x, block_y_bottom);

      /*
      // REMOVE
      __debug.ctx.fillStyle = 'red';
      __debug.ctx.font = '10px "Arial"';
      __debug.ctx.fillText(JSON.stringify({
        block_x_left,
        block_x_right,
        block_y_bottom,
        block_y_offset,
        solid_below,
      }), 100, 400);
      __debug.ctx.fillStyle = 'rgba(0, 250, 0, 0.2)';
      for (let x_ = block_x_left; x_ <= block_x_right; ++x_) {
        const p = __game__.pos_to_pixel(x_, block_y_bottom);
        __debug.ctx.fillRect(p.x, p.y, __game__.block_size_px - 1, __game__.block_size_px - 1);
      }
      */

      if (solid_below) {
        // if no space below then not falling
        if (!block_y_offset) return false;

        // is space close to zero? then lands
        if (1 - block_y_offset <= dy) {
          this.y = block_y_bottom + tile.box.bottom;
          return false;
        }
      }

      // falls
      this.y += dy;
      return true;
    },



  };

  return creature;
}
