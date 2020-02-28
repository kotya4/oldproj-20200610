
function Interface() {
  const interface = document.getElementsByClassName('interface')[0];
  const activator = document.getElementById('activator');
  const input_timer = document.getElementById('input-timer');
  const range_rot_x = document.getElementById('range-rot-x');
  const rot_x_value = document.getElementById('rot-x-value');
  const range_rot_y = document.getElementById('range-rot-y');
  const rot_y_value = document.getElementById('rot-y-value');
  const range_rot_z = document.getElementById('range-rot-z');
  const rot_z_value = document.getElementById('rot-z-value');
  const range_depth = document.getElementById('range-depth');
  const depth_value = document.getElementById('depth-value');
  const range_size = document.getElementById('range-size');
  const size_value = document.getElementById('size-value');
  const gen_value = document.getElementById('gen-value');
  const btn_play = document.getElementById('btn-play');
  const btn_next = document.getElementById('btn-next');
  let drawing_object = null;
  let start_func = null;
  let stop_func = null;
  let gen_func = null;
  let playing = true;
  let timer = 1000;
  let visible = false;

  const switch_me = (p) => {
    playing = !p;
    if (playing) {
      btn_play.innerHTML = 'Stop';
      start_func(timer);
    } else {
      btn_play.innerHTML = 'Play';
      stop_func();
    }
  }

  activator.onclick = () => {
    visible = !visible;
    if (visible) interface.style.display = 'block';
    else interface.style.display = 'none';
  }
  btn_play.onclick = () => switch_me(playing);
  btn_next.onclick = () => {
    update_values({ gen: gen_func() });
  }
  range_rot_x.oninput = () => {
    switch_me(true);
    drawing_object.rotx = range_rot_x.value / 100;
    rot_x_value.innerHTML = ~~(range_rot_x.value) / 100;
  }
  range_rot_y.oninput = () => {
    switch_me(true);
    drawing_object.roty = range_rot_y.value / 100;
    rot_y_value.innerHTML = ~~(range_rot_y.value) / 100;
  }
  range_rot_z.oninput = () => {
    switch_me(true);
    drawing_object.rotz = range_rot_z.value / 100;
    rot_z_value.innerHTML = ~~(range_rot_z.value) / 100;
  }
  range_size.oninput = () => {
    switch_me(true);
    drawing_object.size = range_size.value;
    size_value.innerHTML = range_size.value;
  }
  range_depth.oninput = () => {
    switch_me(true);
    drawing_object.depth = range_depth.value;
    depth_value.innerHTML = range_depth.value;
  }
  input_timer.oninput = () => {
    switch_me(true);
    timer = ~~input_timer.value;
  }

  function update_values({ rotx, roty, rotz, size, gen, depth }) {
    if (rotx != null) {
      range_rot_x.value = ~~(rotx * 100) % 628;
      rot_x_value.innerHTML = range_rot_x.value / 100;
    }
    if (roty != null) {
      range_rot_y.value = ~~(roty * 100) % 628;
      rot_y_value.innerHTML = range_rot_y.value / 100;
    }
    if (rotz != null) {
      range_rot_z.value = ~~(rotz * 100) % 628;
      rot_z_value.innerHTML = range_rot_z.value / 100;
    }
    if (size != null) {
      range_size.value = size;
      size_value.innerHTML = ~~(range_size.value * 100) / 100;
    }
    if (gen != null) {
      gen_value.innerHTML = gen;
    }
    if (depth != null) {
      range_depth.value = depth;
      depth_value.innerHTML = range_depth.value;
    }
  }

  function set_auto_interval_func(start, stop, gen) {
    start_func = start;
    stop_func = stop;
    gen_func = gen;
  }

  function set_drawing_object(o) {
    drawing_object = o;
  }

  return {
    update_values,
    set_drawing_object,
    set_auto_interval_func
  }
}
