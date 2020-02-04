//
// var Random = new Math.seedrandom('myseed');

window.onload = function() {
  Math.seedrandom(5);

  const graphics = Graphics(500, 500);
  const renderer = Renderer(graphics);
}
