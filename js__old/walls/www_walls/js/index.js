
function onload() {

  const cvs = document.createElement('canvas');
  cvs.width = 400;
  cvs.height = 400;
  document.body.appendChild(cvs);
  const ctx = cvs.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const walls = new Walls({
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    depth: 10
  });
  walls.demo(ctx);

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
('www_walls/js/', [
  'walls.js'
]);
