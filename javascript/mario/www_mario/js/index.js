window.onload = function () {

  const keyboard = Keyboard();
  const storage = Storage();
  const render = Render();
  const mouse = Mouse(render.ctx.canvas);


  // REMOVE
  __debug.ctx = render.ctx;


  const map = Map(render.sizes(), 30);
  map.update_from_storage(storage);


  mouse.listen(_ => {
    if (mouse.is_left_down) {
      const { x, y } = map.cvt_to_map(mouse.x, mouse.y);
      map.put_to(x, y, 1);
      storage.save('map', map.map);
    }
    if (mouse.is_right_down) {
      const { x, y } = map.cvt_to_map(mouse.x, mouse.y);
      map.put_to(x, y, 0);
      storage.save('map', map.map);
    }
  });


  keyboard.listen(_ => {
    //if (keyboard.is_pressed) console.log(keyboard.trace());
  });


  const player = Player({
    sprites: {},
    position: { x: 9, y: 9 },
  });


  render.start((ctx, elapsed) => {
    map.draw(ctx);

    if (keyboard.pressed('KeyA')) {
      player.move(map, elapsed, 'left');
    }

    if (keyboard.pressed('KeyD')) {
      player.move(map, elapsed, 'right');
    }

    if (keyboard.pressed('Space')) {
      player.move(map, elapsed, 'up');
    } else {
      //player.move(map, elapsed, 'down');
    }

    // draw

    player.draw(ctx);

    map.draw_mouse(ctx, mouse.x, mouse.y);
    mouse.draw(ctx);
  });

}

const __debug = {};
