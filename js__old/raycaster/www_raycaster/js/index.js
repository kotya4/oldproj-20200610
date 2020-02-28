
function onload() {
  const wrapper = document.getElementsByClassName('wrapper')[0];
  // canvas
  const cvs = document.createElement('canvas');
  cvs.width = 400;
  cvs.height = 400;
  wrapper.appendChild(cvs);
  const ctx = cvs.getContext('2d');
  // keyboard
  const keys = {};
  window.onkeyup = e => keys[e.keyCode] = false;
  window.onkeydown = e => keys[e.keyCode] = true;
  // textures
  const textures = Textures();
  // map
  const map = Map.map;
  // collision detector
  const correct_collision = CollisionDetector();
  // ,--------------,
  // |some constants|
  // '--------------'
  const camera = { x: 8, y: 8, old_x: 0, old_y: 0, angle: 0.4 };
  let {
    rotation_speed, // rotation speed
    textures_on,    // textures on?
    angle_step,     // offset for each ray angle
    scale_w,        // width of one column
    fisheye,        // fisheye correction
    col_num,        // number of columns to draw per frame
    speed,          // movement speed
    depth,          // how far can we see (in blocks)
    step,           // ray step
    fov,            // field of view
  } = init_constants({});
  function init_constants(o) {
    const fov = 'fov' in o ? o.fov : Math.PI / 3;
    const col_num = 'col_num' in o ? o.col_num : ~~cvs.width;
    const scale_w = cvs.width / col_num;
    const angle_step = fov / col_num;
    return Object.assign({
      rotation_speed: 0.1,
      textures_on: false,
      fisheye: false,
      speed: 0.2,
      depth: 20,
      step: 0.01,
    }, o, {
      fov,
      col_num,
      scale_w,
      angle_step,
    });
  }
  // ,--------------,
  // |   drawing    |
  // '--------------'
  setInterval(() => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let angle = camera.angle - fov / 2;
    for (let i = 0; i < col_num; ++i) {
      angle += angle_step;
      const sina = Math.sin(angle);
      const cosa = Math.cos(angle);
      for (let distance = 0; distance < depth; distance += step) {
        const real_x = camera.x + sina * distance;
        const real_y = camera.y + cosa * distance;
        const x = ~~real_x;
        const y = ~~real_y;
        if (x < 0 || y < 0 || x >= map.length || y >= map[0].length) break;
        if (map[x][y]) {
          const cdist = distance * (fisheye ? 1 : Math.cos(camera.angle - angle));
          const h = cvs.height / (cdist + 1);
          if (textures_on) { // draws textures
            const img = map[x][y] < textures.length ? textures[map[x][y]] : textures[textures.length - 1];
            //console.log(img);
            const img_x = Math.abs((real_x - x) - (real_y - y))  * img.width;
            ctx.drawImage(img, img_x, 0, scale_w, img.height, i * scale_w, cvs.height / 2 - h, scale_w, h * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${cdist / depth})`;
          } else { // draws colors
            ctx.fillStyle = `rgba(${Map.colors[map[x][y] % Map.colors.length]}, ${1 - cdist / depth})`;
          }
          ctx.fillRect(i * scale_w, cvs.height / 2 - h - 1, scale_w, h * 2 + 2);
          break;
        }
      }
    }
    // ,--------------,
    // |   keyboard   |
    // '--------------'
    let dx = 0;
    let dy = 0;
    if (keys[81]) {
      dx -= Math.cos(camera.angle) * speed;
      dy += Math.sin(camera.angle) * speed;
    }
    if (keys[69]) {
      dx += Math.cos(camera.angle) * speed;
      dy -= Math.sin(camera.angle) * speed;
    }
    if (keys[87]) {
      dx += Math.sin(camera.angle) * speed;
      dy += Math.cos(camera.angle) * speed;
    }
    if (keys[83]) {
      dx -= Math.sin(camera.angle) * speed;
      dy -= Math.cos(camera.angle) * speed;
    }
    if (keys[65]) {
      camera.angle -= rotation_speed;
      if (camera.angle > Math.PI * 2) camera.angle = camera.angle - Math.PI * 2;
      else if (camera.angle < 0) camera.angle = Math.PI * 2 + camera.angle;
    }
    if (keys[68]) {
      camera.angle += rotation_speed;
      if (camera.angle > Math.PI * 2) camera.angle = camera.angle - Math.PI * 2;
      else if (camera.angle < 0) camera.angle = Math.PI * 2 + camera.angle;
    }
    // ,-------------------------,
    // |   collision detection   |
    // '-------------------------'
    if (dx || dy) {
      camera.old_x = camera.x;
      camera.old_y = camera.y;
      camera.x += dx;
      camera.y += dy;
      const x = ~~camera.x;
      const y = ~~camera.y;
      if (map[x][y]) {
        [
          [[x + 1, y + 1], [x + 0, y + 1]],
          [[x + 1, y + 0], [x + 0, y + 0]],
          [[x + 1, y + 0], [x + 1, y + 1]],
          [[x + 0, y + 0], [x + 0, y + 1]],
        ].forEach(l => {
          const c = correct_collision([[camera.old_x, camera.old_y], [camera.x, camera.y]], l);
          if (c != null) {
            camera.x = c[0];
            camera.y = c[1];
          }
        });
      }
    }
    // ,--------------,
    // |   minimap    |
    // '--------------'
    const s = 5;
    const rcos = Math.cos(camera.angle - fov / 2);
    const rsin = Math.sin(camera.angle - fov / 2);
    const lcos = Math.cos(camera.angle + fov / 2);
    const lsin = Math.sin(camera.angle + fov / 2);
    for (let x = 0; x < map.length; ++x) for (let y = 0; y < map[0].length; ++y) {
      ctx.fillStyle = `rgb(${Map.colors[map[x][y] % Map.colors.length]})`;
      ctx.fillRect(x * s, y * s, s, s);
    }
    ctx.fillStyle = 'blue';
    ctx.fillRect(camera.x * s - s / 2, camera.y * s - s / 2, s, s);
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(camera.x * s, camera.y * s);
    ctx.lineTo(camera.x * s + s * 10 * rsin, camera.y * s + s * 10 * rcos);
    ctx.moveTo(camera.x * s, camera.y * s);
    ctx.lineTo(camera.x * s + s * 10 * lsin, camera.y * s + s * 10 * lcos);
    ctx.stroke();
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
('www_raycaster/js/', [
  'collisiondetector.js',
  'textures.js',
  'map.js',
]);
