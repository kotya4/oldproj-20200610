
function onload() {
  const interface = Interface();
  const wrapper = document.getElementsByClassName('canvas-wrapper')[0];
  const colors = [...Array(20)].map(() => [...[0, 0, 0].map(Math.random), 1.0]);
  const auto3d = Automata3d([], [], null);
  const webgl = WebGL(500, 500, wrapper);
  const cube = webgl.init_vbo_for_cube();

  // generating
  let gen = 1;
  let drawing = true;
  const proc_auto3d = () => {
    const map = auto3d.dump().map;
    for (let x = 0; x < map.length; ++x)
      for (let y = 0; y < map[0].length; ++y)
        for (let z = 0; z < map[0][0].length; ++z)
          auto3d.proc(x, y, z);
    auto3d.swap();
    ++gen;
  }
  //for (let i = 0; i < ~~(Math.random() * 50); ++i) proc_auto3d();
  let auto_id = setInterval(proc_auto3d, 1000);
  interface.set_auto_interval_func((timer) => {
    drawing = true;
    if (timer > 0 && auto_id == null) auto_id = setInterval(proc_auto3d, timer);
  }, () => {
    if (auto_id != null) auto_id = clearInterval(auto_id);
    auto_id = null;
    drawing = false;
  }, () => {
    proc_auto3d();
    return gen;
  });

  // drawing
  const dro = {
    depth: 130,
    size: 2,
    dsize: 0,
    rotx: 0.5,
    roty: 0.5,
    rotz: 0.0,
  };
  interface.set_drawing_object(dro);
  setInterval(() => {
    webgl.clear();
    const chunked = auto3d.chunked();
    const map = chunked.map;
    for (let x = 0; x < map.length; ++x)
      for (let y = 0; y < map[0].length; ++y)
        for (let z = 0; z < map[0][0].length; ++z)
          if (map[x][y][z]) {
            webgl.set_modelview(
              mat.create_gl_identity()
                .gl_translate(
                  ((map.length >> 1) - x) * dro.size,
                  ((map[0].length >> 1) - y) * dro.size,
                  ((map[0][0].length >> 1) - z) * dro.size)
                .gl_rotate(dro.rotx, 'x')
                .gl_rotate(dro.roty, 'y')
                .gl_rotate(dro.rotz, 'z')
                .gl_translate(0, 0, dro.depth)
                .float32Array());
              cube.draw(colors[chunked.sizes[map[x][y][z]] % colors.length]);
          }
    if (drawing) {
      dro.rotx += 0.005;
      dro.roty += 0.005;
      dro.rotz += 0.000;
      dro.dsize += 0.01;
      dro.size = 2 + Math.abs(Math.sin(dro.dsize)) * 1.5;
      interface.update_values({
        rotx: dro.rotx,
        roty: dro.roty,
        rotz: dro.rotz,
        size: dro.size,
        depth: dro.depth,
        gen,
      });
    }
  }, 50);
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
('www_automata3d/js/', [
  'interface.js',
  'automata.js',
  'webgl.js',
  'mat.js',
]);
