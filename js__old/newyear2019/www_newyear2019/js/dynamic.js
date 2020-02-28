function Dynamic({ name, pos, speed, sprites, default_keys }) {

  let current_sprite_keys = Object.assign({ action: 'stand', direction: 'front' }, default_keys);
  let current_sprite = null;
  if (null !== sprites) update_sprite();

  const offset = [0, 0];      // смещение от 0 до 1
  const last_pos = [-1, -1];  // последняя позиция из set_path_to
  const direction = [0, 0];   // направление движения от -1 до +1
  let path = null;      // текущий путь
  let new_path = null;  // новый путь (применяется после того, как положение зафиксировано)
  let path_index = 1;   // индекс следующего положения (из path)
  speed /= 100; // скорость движения

  let manual_moving = false;

  let pf = null;
  let grid = null;


  function set_pf(__pf, __grid) {
    pf = __pf;
    grid = __grid;
  }

  function draw_on(ctx) {
    //ctx.fillStyle = 'black';
    //ctx.fillText(`pos: ${pos}, dir: ${direction}`, 10, 160);
    // нарисовать спрайт, если он существует
    if (current_sprite) current_sprite.draw_on(ctx, pos[0] + offset[0], pos[1] + offset[1]);
    if (path || manual_moving) { // если определен путь, тогда
      offset[0] += speed * direction[0]; // сделать шаг
      offset[1] += speed * direction[1];
      // проверить, находимся ли мы на новой клетке (фиксация положения)
      if (direction[0] > 0 && offset[0] >= +1
      ||  direction[0] < 0 && offset[0] <= -1
      ||  direction[1] > 0 && offset[1] >= +1
      ||  direction[1] < 0 && offset[1] <= -1
      ) {
        pos[0] += offset[0] | 0;
        pos[1] += offset[1] | 0;
        offset[0] = 0; // обнулить смещение
        offset[1] = 0;
        if (manual_moving) {
          manual_moving = false;
          update_sprite('stand');
          return;
        }
        iter_path(); // и проитерировать индекс пути
      }
    }
  }

  function set_path_to(x, y) {
    // если этот путь уже выбран, то перевычислять не нужно
    if (last_pos[0] === x && last_pos[1] === y) return;
    last_pos[0] = x; // запомнить выбранный путь
    last_pos[1] = y;
    // создать новый путь (будет применен после того, как положение будет зафиксировано)
    new_path = pf.findPath(...(path ? path[path_index] : pos), x, y, grid.clone());
    if (!path) iter_path(); // если путь до этого не был определен, проитерировать путь
  }

  function iter_path() {
    ++path_index; // выбрать следующее значение из path
    if (new_path) {     // если был определен новый путь, то
      path_index = 1;   // обнулить индекс пути,
      path = new_path;  // скопировать новый путь в path
      new_path = null;  // и обнулить указатель нового пути.
    }
    if (path_index < path.length) { // если путь еще не завершен, то
      direction[0] = path[path_index][0] - pos[0]; // обновить направление движения.
      direction[1] = path[path_index][1] - pos[1];
           if (direction[0] > 0) update_sprite('move', 'right');
      else if (direction[0] < 0) update_sprite('move', 'left');
      else if (direction[1] > 0) update_sprite('move', 'front');
      else if (direction[1] < 0) update_sprite('move', 'back');
    }
    else {
      update_sprite('stand', null);
      path = null; // иначе, обнулить указатель пути.
    }
  }

  function update_sprite(action, direction) {
    if (action != null) current_sprite_keys.action = action;
    if (direction != null) current_sprite_keys.direction = direction;
    current_sprite = sprites[current_sprite_keys.action][current_sprite_keys.direction];
  }

  function move_to(__x, __y) {
    if (manual_moving) return;
         if (__x > 0) update_sprite(null, 'right');
    else if (__x < 0) update_sprite(null, 'left');
    else if (__y > 0) update_sprite(null, 'front');
    else if (__y < 0) update_sprite(null, 'back');
    const x = pos[0] + __x;
    const y = pos[1] + __y;
    if ( y >= 0 && y < grid.nodes.length 
      && x >= 0 && x < grid.nodes[0].length
      && grid.nodes[y][x].walkable)
    {
      direction[0] = __x;
      direction[1] = __y;
      manual_moving = true;
      update_sprite('move', null);
    }
  }


  return {
    draw_on,
    set_path_to,
    move_to,
    set_pf
  }
}