
function onload() {

  const kb = Keyboard();

  const scene = Scene({ width: 16 * 24, height: 16 * 16, scale: 2 });

  Tileset(16, 'www_newyear2019/img/',
    ['lynk.png',    [16, 27]],
    ['map0.png',    [16, 16]],
    ['tree0.png',   [48, 64]],
    ['winter0.png', [16, 16]],
  ).then(tileset => {
    tileset = tileset[0];

    const player_sprite = Sprite(tileset.get('lynk'), [0], 10);

    const player = Dynamic({
      name: 'player',
      pos: [5, 5],
      speed: 10,
      sprites: {
        'stand': {
          'front': player_sprite,
          'back' : player_sprite.copy(null, [4]),
          'left' : player_sprite.copy(null, [2]),
          'right': player_sprite.copy(null, [2], null, true),
        },
        'move': {
          'front': player_sprite.copy(null, [0, 1]),
          'back' : player_sprite.copy(null, [4, 5]),
          'left' : player_sprite.copy(null, [2, 3]),
          'right': player_sprite.copy(null, [2, 3], null, true),
        },
      },
    });

    function generator(w, h, bg, fg, gr) {
      const ground_frames = [240, 241, 242, 243, 244, 245];
      
      const sprites = {
        ground: Sprite(tileset.get('winter0'), ground_frames, { stopped: true, current_frame: 0 }),
        tree: Sprite(tileset.get('tree0'), [0], null, true),
      };
      
      const noise = Noises().perlin3();
      const factor = 0.2;
      for (let y = 0; y < h; ++y) {
        for (let x = 0; x < w; ++x) {
          bg[y][x] = sprites.ground.copy(null, null, { stopped: true, current_frame: Math.random() * 6 | 0 });
          
          const n = noise(x * factor, y * factor, 0);
          if ((x + y) % 2 === 0 && n > 0.2) {
            fg[y][x] = sprites.tree;//.copy(null, null, null, Math.random() > 0.5);
            gr.setWalkableAt(x, y, false);
          } else if (n > 0) {
       
          }

        }
      }
    }


    const level = Level({ width: 24, height: 16, objects: [player], generator });


    scene.start_render(({ ctx, fps }) => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = 'white';
      ctx.fillText('TEST', 20, 20);

      level.draw_on(ctx);

      if (kb.pressed(68)) player.move_to(+1, +0);
      if (kb.pressed(83)) player.move_to(+0, +1);
      if (kb.pressed(65)) player.move_to(-1, -0);
      if (kb.pressed(87)) player.move_to(-0, -1);

      return scene.CONTINUE;
    });
  });


}

/*
 * Loader
 */
((path, a) => {
  function loadjs(src, async = true) {
    return new Promise((res, rej) => 
      document.head.appendChild(Object.assign(document.createElement('script'), {
        src,
        async,
        onload: _ => res(src),
        onerror: _ => rej(src)
      }))
    )
  }
  Promise.all(a.map(e => loadjs(path + e)))
    .then(_ => window.addEventListener('load', onload))
    .catch(src => console.log(`File "${src}" not loaded`));
})
('www_newyear2019/js/', [
  'noises.js',
  'tileset.js',
  'keyboard.js',
  'scene.js',
  'sprite.js',
  'level.js',
  'dynamic.js',
  'third/pathfinding-browser.js'
]);

/*
 * Useful global functions 
 */
function sample(a) {
  return a[Math.random() * a.length | 0];
}
function alloc(size, fill = null) {
  return [...Array(size[0])].map(() =>  size.length > 1 
    ? alloc(size.slice(1, size.length), fill)
    : fill
  );
}
function last(a) {
  return a[a.length - 1];
}