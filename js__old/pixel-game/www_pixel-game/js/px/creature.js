
px.Creature = function(args) {
  const arg = px.utils.create_argument_parser('px.Creature', args);
  const pos = arg('position', { x: 10, y: 10 });
  const spd = arg('speed', { x: 0, y: 0 });
  const acc = arg('acceleration', { x: 0.03, y: 0.02 });
  const inh = arg('inhibition', { x: 0.015, y: 0.02 });
  const size = arg('size', 9);
  const color = arg('color', 'white');
  const walls = arg('walls', []);
  const max_spd = arg('max_speed', { x: 0.15, y: 0.5 });
  const platforms = arg('platforms');
  const jump_strength = arg('jump_strength', 0.3);
  let acc_echo = 0; // last non-zero spd.x value (in porc. walls)
  let falling = false;
  let jumping = false;
  let accelerating = false;

  function proc_gravity() {
    if (spd.y < 0)
      return; // no need to proc gravity if entity jumps up
    const on_platform = platforms
      .find(e => e
        .is_near_by(pos.x, pos.y, size));
    if (on_platform) {
      if (falling) {
        jumping = false;
        falling = false;
        spd.y = 0;
        pos.y = on_platform.height;
      }
    } else {
      falling = true;
      if (spd.y < max_spd.y)
        spd.y += acc.y;
    }
  }

  function proc_moving(e) {
    if (!accelerating && spd.x !== 0) {
      if (spd.x > 0)
        spd.x -= inh.x;
      else if (spd.x < 0)
        spd.x += inh.x;
      if (Math.abs(spd.x) <= inh.x)
        spd.x = 0;
    }
    if (spd.y < 0)
      spd.y += inh.y;
    accelerating = false;
    pos.x += spd.x * e;
    pos.y += spd.y * e;
    const wall = walls
      .find(elem => elem
        .is_near_by(pos.x, pos.y, size, acc_echo));
    if (wall) {
      pos.x = wall.width - (acc_echo > 0 ? size + 1 : -1);
      spd.x = 0;
    }
    const ceiling = platforms
      .find(elem => elem
        .is_near_by_ceiling(pos.x, pos.y, size, spd.y));
    if (ceiling) {
      pos.y = ceiling.height + size;
      spd.y = 0;
    }
  }

  function proc(e) {
    proc_gravity();
    proc_moving(e);
  }

  function accelerate(x) {
    accelerating = true;
    if (x > 0 && spd.x < max_spd.x)
      spd.x += acc.x;
    else if (x < 0 && spd.x > -max_spd.x)
      spd.x -= acc.x;
    acc_echo = spd.x;
  }

  function jump() {
    if (!jumping) {
      jumping = true;
      spd.y = -jump_strength;
    }
  }

  function draw(ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(pos.x | 0, pos.y | 0, size, -size);
  }

  this.draw = draw;
  this.proc = proc;
  this.jump = jump;
  this.accelerate = accelerate;
}