/*
 * This module written by sluchaynayakotya@gmail.com for
 * visualize calculation of xor-surface by handmade linear
 * neural network -- NeuralKotya. So, important modules are:
 * - neuralkotya.js,
 * - mat.js,
 * - webgl.js (kind of).
 * All other modules are wrappers hiding things such
 * as canvas initialization, visualization, etc.
 * Feb, 2019
 */

function onload() {
  const v2d = Visualization(280, 400, 'canvas-wrapper'); // 2d surface
  const webgl = WebGL(400, 400, 'canvas-wrapper'); // webgl context (3d surface)
  const cube = webgl.prepare_line_strip_cube(0.5); // verices for drawing cube with scale factor 0.5
  const nnman = NNManager(); // neural network manager (NeuralKotya wrapper)

  let rot = 0; // 3d rotation
  setInterval(() => {
    // NN learns for 100 times per frame
    nnman.learn(100);

    v2d.clear(); // clears 2d canvas
    v2d.draw_edges(...nnman.buffer_size()); // draws edges of 2d visualisation
    v2d.draw_nn(nnman.neural()); // draws neural network as graph

    // fills xor-surface buffer and draws data
    nnman.fill_buffer_and_call((x, y, z) => v2d.draw_point(x, y, z));

    // prints all matrices as tables in the container
    nnman.print_all_data();

    // converts into Float32Array
    const vertices = webgl.prepare_vertices(nnman.buffer());

    // some 3d camera transformations
    webgl.uniform_tranformation_matrix(
      mat.create_gl_identity()
        .gl_rotate(+rot, 'y')
        .gl_rotate(-0.5, 'x')
        .gl_translate(0, 0, 2.5)
        .gl_projection(Math.PI / 4, webgl.ratio(), 0.1, 100)
        .float32Array());

    // draws cube and xor-surface
    webgl.clear();
    webgl.buffer_and_draw_vertices(cube, webgl.gl.LINE_STRIP);
    webgl.buffer_and_draw_vertices(vertices, webgl.gl.POINTS);

    rot += 0.01;
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
('www_neural/js/', [
  'mat.js',
  'webgl.js',
  'neuralkotya.js',
  'visualization.js',
  'nnmanager.js',
]);
