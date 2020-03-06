
px.Scroll = function(args) {
  const arg = px.utils.create_argument_parser('px.Scroll', args);
  const spd = arg('speed', 0.03);
  const pos = arg('pos', [50, 50]);
  const refs = arg('refs', arg('ref', [px.Scroll]));
  const sizes = arg('sizes', arg('size', [204, 100]));
  const color = arg('color', 'pink');
  let spos_y = arg('spos_y', 0);
  const text = Array
    .from(refs instanceof Array ? refs : [refs, ])        // All references must be array:
    .map(e => e.toString()).join('\n')                    // becomes     a      mono-text,
    .replace(/ +/gm, ' ')                                 // removes  additional   spaces,
    .split('\n').filter(e => e.length).map(e => e =
      `0x${[...Array(2)]
        .map(e => '0123456789ABCDEF'[px.utils.rand(16)])  // removes additional '\n's  and
        .join('')} ${e.toString().trim()}`)               // adds  fake  comand  adresses.
    .join('\n');
  const rows_num = 1 + (text.match(/\n/g) || []).length;
  const height = rows_num * (1 + px.utils.text.symbol_height);
  const cvs = document.createElement('canvas');
  {
    const ctx = cvs.getContext('2d');
    cvs.width = sizes[0];
    cvs.height = height;
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.fillStyle = color;
    px.utils.text.print(ctx, text, 0, 0);
  }

  this.proc = function(elapsed) {
    spos_y += elapsed * spd;
    if (spos_y >= height)
      spos_y = 0;
  }

  this.draw = function(ctx) {
    ctx.drawImage(cvs, 0, spos_y | 0, sizes[0], sizes[1],
                  pos[0], pos[1], sizes[0], sizes[1]);
    if (spos_y > height - sizes[1])
      ctx.drawImage(cvs, 0, spos_y - height | 0, sizes[0], sizes[1],
                    pos[0], pos[1], sizes[0], sizes[1]);
  }
}