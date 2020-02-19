
window.onload = async () => {
  const display_height = 300;
  const display_width = 640;
  const rownum = 25;
  const colnum = 80;

  const ctx = document.createElement('canvas').getContext('2d');
  document.body.appendChild(ctx.canvas);
  ctx.canvas.height = display_height;
  ctx.canvas.width = display_width;

  ctx.fillStyle = 'grey';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Algorithm description:
  // ---------------------------------------------------------
  // We'll draw a character, then on top of it we draw a line.
  // Then, we calculate  how  many  pixels  was  redrawen.  In
  // ideal, we need to redraw all pixels  wich  were  occupied
  // with symbol, but do not touch any other  pixels.  In this
  // case we are found symbol that  represents  current  line.
  // ---------------------------------------------------------

  await new Promise(r => FontDetect.onFontLoaded('Clacon', r));
  // Clacon (Terminal) font is a 8x16 fixed  width  font:
  //      http://webdraft.hu/fonts/classic-console/
  // So, we expect "width / height" ratio would  be  0.5,
  // but it not. To calculate height, we need to multiply
  // our ratio with REAL height.
  const expected_font_height = 16;
  const expected_font_width = 8;
  const expected_font_ratio = expected_font_width / expected_font_height;
  // REAL ratio is 0.390625. Always use real font height to set up font.
  const real_font_height = 20;
  ctx.font = `${real_font_height}px "Clacon"`;
  const real_font_width = ctx.measureText('X').width;
  // To achive better image I'm adding some space between characters.
  const font_additional_height = 1;
  const font_additional_width = 0;
  // Calculated font size ready to use:
  const font_height = font_additional_height + real_font_height * expected_font_ratio;
  const font_width = font_additional_width + real_font_width;

  // Calculations above must be done for all used font sizes.
  // In HTML5 Canvas's "fillText" and "stroke" functions drew
  // with antialiazing and  it  can't  be  turned  off.  This
  // will cause trouble on detecting  real  pixels  in  small
  // displays. So, font sizes used in raster  may  not  match
  // font sizes used to draw on real display.

  const raster_block_size = 8; // Depends on font size.
  const raster_height = Math.ceil(rownum * font_height / raster_block_size);
  const raster_width = Math.ceil(colnum * font_width / raster_block_size);

  // Allocating memory for raster (Boolean).
  const raster = [...Array(raster_height)].map(_ => [...Array(raster_width)].map(_ => false));

  for (let y = 0; y < raster_height; ++y)
    for (let x = 0; x < raster_width; ++x)
  {
    const rgb = ['255, 0, 0', '255, 255, 0'][(x + y) % 2];
    ctx.fillStyle = `rgba(${rgb}, 0.5)`;
    ctx.fillRect(x * raster_block_size, y * raster_block_size, raster_block_size, raster_block_size);
  }

  ctx.fillStyle = 'black';
  for (let y = 0; y < rownum; ++y)
    for (let x = 0; x < colnum; ++x)
  {
    const ch = ['\\', '/'];
    ctx.fillText(ch[Math.random() * ch.length | 0], font_width * x, font_height * (y + 1));
  }


  // const testing_symbols = '\\|/-_+=`\'".,<>()*^!v:;';


  const offs = 256 * 8;
  for (let i = 0; i < 256; ++i) {
    const x = i % 16;
    const y = i / 16 | 0;
    // const ch = String.fromCharCode(i + offs);
    // const ch = ('йцукенгшщзфыывапролджэячсмитьбю' + 'йцукенгшщзфыывапролджэячсмитьбю'.toUpperCase()).split('');
    // const ch = exploring_symbols;

  }



}
