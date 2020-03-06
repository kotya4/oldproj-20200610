
function onload() {
  const wrapper = document.getElementsByClassName('wrapper')[0];

  const cvs = document.createElement('canvas');
  cvs.width = 400;
  cvs.height = 400;
  wrapper.appendChild(cvs);
  const ctx = cvs.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = 'white';




  const rw = 3;
  const rh = 3;
  const ro = 1;
  const ww = ~~(cvs.width / rw);
  const wh = ~~(cvs.height / rh);
  const buffer1 = [...Array(ww)].map(() => [...Array(wh)].map(() => Math.random() > 0.1 ? 1 : 0));
  const buffer2 = [...Array(ww)].map(() => [...Array(wh)]);
  let map = buffer1;
  let buffer = buffer2;

  const draw_map = () => {
    const fill_rect = (e, x, y) => {
      ctx.fillStyle = [
        'black',
        'white',
      ][e];
      ctx.fillRect(x * rw, y * rh, rw - ro, rh - ro);
    }
    map.map((e, x) => e.map((e, y) => fill_rect(e, x, y)));
  }

  const logic = (x, y, min, max) => {
    //const min = 2;
    //const max = 3;
    const radius = 1;
    let num = 0;
    for (let ox = 0; ox <= radius * 2; ++ox) for (let oy = 0; oy <= radius * 2; ++oy) {
      let _x = x - radius + ox;
      let _y = y - radius + oy;
      if (_x < 0) _x = map.length + _x; else if (_x >= map.length) _x = _x - map.length;
      if (_y < 0) _y = map[0].length + _y; else if (_y >= map[0].length) _y = _y - map[0].length;
      if (_x === x && _y === y) continue;
      num += map[_x][_y];
    }
    if (num < min || num > max) buffer[x][y] = 0; else buffer[x][y] = 1;
    return num;
  }

  let c1min = 2;
  let c1max = 3;
  let c2min = 4;
  let c2max = 6;
  let c1min_alive = 3;
  let c1max_alive = 55000;
  let c2min_alive = 1500;

  let min = c1min;
  let max = c1max;
  let inv = false;
  const swap = () => {
    if (map === buffer1) {
      map = buffer2;
      buffer = buffer1;
    } else {
      buffer = buffer2;
      map = buffer1;
    }
  }

  let num = 0;

  const start = () => {
    return setInterval(() => {
      num = 0;

      for (let x = 0; x < map.length; ++x)
        for (let y = 0; y < map[0].length; ++y)
          num += logic(x, y, min, max);

      swap();

      draw_map();

      if (num < c1min_alive || num > c1max_alive && num < c1max_alive + 5000) {
        if (num === 0) {
          map.forEach((e, x) => e.forEach((_, y) => map[x][y] = Math.random() > 0.1 ? 1 : 0));
          return;
        }
        if (!inv) {
          min = c2min;
          max = c2max;
          inv = true;
        }
      }

      if (inv) {
        if (num < c2min_alive) {
          min = c1min;
          max = c1max;
          inv = false;
          map.forEach((e, x) => e.forEach((_, y) => map[x][y] = Math.random() > 0.1 ? 1 : 0));
        }
      }

      info({
        cycle: inv ? 2 : 1,
        max: max,
        min: min,
        num: num,
        reset_in_cycle_1_if_less_than: c1min_alive,
        reset_in_cycle_2_if_less_than: c2min_alive,
        cycle_2_starts_then_more_than: c1max_alive,
        '<br><br>created': 'Feb, 2019'
      });

    }, 100);
  }

  let interval_id = start();

  function info(o) {
    let s = '';
    for (let k in o) {
      s += k + ': ' + o[k] + '<br>';
    }
    document.getElementById('info').innerHTML = s;
  }

  function onstart() {
    if (interval_id == null) interval_id = start();
  }

  function onstop() {
    if (interval_id != null) {
      clearInterval(interval_id);
      interval_id = null;
    }
  }

  function onreset() {
    onstop();
    map.forEach((e, x) => e.forEach((_, y) => map[x][y] = Math.random() > 0.1 ? 1 : 0));
    c1min = ~~document.getElementById('min1').value;
    c1max = ~~document.getElementById('max1').value;
    c2min = ~~document.getElementById('min2').value;
    c2max = ~~document.getElementById('max2').value;
    c1min_alive = ~~document.getElementById('min_alive1').value;
    c1max_alive = ~~document.getElementById('max_alive1').value;
    c2min_alive = ~~document.getElementById('min_alive2').value;
    min = c1min;
    max = c1max;
    inv = false;
    onstart();
  }

  document.getElementById('btn_start').onclick = onstart;
  document.getElementById('btn_stop').onclick = onstop;
  document.getElementById('btn_reset').onclick = onreset;

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
('www_automat/js/', [

]);
