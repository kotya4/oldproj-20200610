function Level({ width, height, objects, generator, sprites }) {

  const background = alloc([height, width]);
  const foreground = alloc([height, width]);
  

  const grid = new PF.Grid(width, height);
  const pf = new PF.AStarFinder();

  if (generator instanceof Function) generator(width, height, background, foreground, grid);

  objects.forEach(e => e.set_pf(pf, grid));


  function draw_on(ctx) {
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        if (background[y][x]) background[y][x].draw_on(ctx, x, y);
        if (foreground[y][x]) foreground[y][x].draw_on(ctx, x, y);
      }
    }
    
    for (let i = 0; i < objects.length; ++i) {
      objects[i].draw_on(ctx);
    }

  }

  return {
    draw_on
  }
}