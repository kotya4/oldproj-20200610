
function onload() {
  const cvs = document.createElement('canvas');
  cvs.width = 400;
  cvs.height = 400;
  document.getElementsByClassName('wrapper')[0].appendChild(cvs);
  const ctx = cvs.getContext('2d');

  const colors = [
    'rgba(0,0,0,0)',
    'lightsalmon',
    'salmon',
    'darksalmon',
    'lightcoral',
    'indianred',
    'crimson',
    'firebrick',
    'red',
    'darkred',
    'lawngreen',
    'chartreuse',
    'limegreen',
    'lime',
    'forestgreen',
    'green',
    'darkgreen',
    'greenyellow',
    'yellowgreen',
    'springgreen',
    'mediumspringgreen',
    'lightgreen',
    'palegreen',
    'darkseagreen',
    'mediumseagreen',
    'seagreen',
    'olive',
    'darkolivegreen',
    'olivedrab',
    'lightcyan',
    'cyan',
    'aqua',
    'aquamarine',
    'mediumaquamarine',
    'paleturquoise',
    'turquoise',
    'mediumturquoise',
    'darkturquoise',
    'lightseagreen',
    'cadetblue',
    'darkcyan',
    'teal',
    'powderblue',
    'lightblue',
    'lightskyblue',
    'skyblue',
    'deepskyblue',
    'lightsteelblue',
    'dodgerblue',
    'cornflowerblue',
    'steelblue',
    'royalblue',
    'blue',
    'mediumblue',
    'darkblue',
    'navy',
    'midnightblue',
    'mediumslateblue',
    'slateblue',
    'darkslateblue',
  ];

  const auto = Automata({
    min: 1,
    max: 3,
    col: 201,
    row: 201,
    init: [[1,1,0,1,1],[1,0,1,1,1],[1,1,1,0,1],[0,0,1,0,1]]
  });
  const dump = auto.dump();
  const rw = ctx.canvas.width / dump.row;
  const rh = ctx.canvas.height / dump.col;

  /*
  for (let i = 0; i < 100; ++i) {
    for (let y = 0; y < dump.col; ++y) for (let x = 0; x < dump.row; ++x) {
      const flag = auto.proc(x, y);
    }
    auto.swap();
  }
  */

  function draw_chunks() {
    const chunk_sizes = [0, 12];
    let chunk_value = 2; // chunk value (must be greater than 1)
    // copies map
    const map = auto.dump().map.map(e => e.slice());
    // recursive chunk maker
    const make_chunk = (y, x) => {
      ++chunk_sizes[chunk_sizes.length - 1];
      map[y][x] = chunk_value;
      const h = map.length;
      const w = map[0].length;
      const pos = [
        [y - 1, x + 0],
        [y + 1, x + 0],
        [y + 0, x - 1],
        [y + 0, x + 1],
      ].map(p => {
        if (p[0] < 0) p[0] += h; else if (p[0] >= h) p[0] -= h;
        if (p[1] < 0) p[1] += w; else if (p[1] >= w) p[1] -= w;
        return p;
      }).forEach(p => {
        if (map[p[0]][p[1]] === 1) {
          make_chunk(...p);
        }
      });
    }
    // searches
    for (let y = 0; y < dump.col; ++y) for (let x = 0; x < dump.row; ++x) {
      // starts "chunking"
      if (map[y][x] === 1) {
        chunk_sizes.push(0);
        make_chunk(y, x);
        ++chunk_value;
      }
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let y = 0; y < dump.col; ++y) for (let x = 0; x < dump.row; ++x) {
      ctx.fillStyle = colors[chunk_sizes[map[y][x]] % colors.length];
      ctx.fillRect(x * rw, y * rh, rw, rh);
    }
  }

  setInterval(() => {
    for (let y = 0; y < dump.col; ++y) for (let x = 0; x < dump.row; ++x) {
      auto.proc(x, y);
    }
    auto.swap();
    draw_chunks();
  }, 500);


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
('www_automat2/js/', [
  'automata.js',
  'automixer.js'
]);
