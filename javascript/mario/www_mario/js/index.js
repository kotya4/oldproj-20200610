window.onload = function () {

  const keyboard = Keyboard();
  const storage = Storage();
  const render = Render();
  const mouse = Mouse(render.ctx.canvas);


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


  render.start((ctx, elapsed) => {

    if (keyboard.pressed('KeyW')) {
      ctx.fillStyle = 'red';
      ctx.fillText('W', 100, 100);
    }

    map.draw(ctx);
    map.draw_mouse(ctx, mouse.x, mouse.y);
    mouse.draw(ctx);
  });
}
