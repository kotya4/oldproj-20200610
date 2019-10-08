//
window.onload = function() {

  WebGL.render_demo();

  const webgl_canvas = document.getElementsByClassName('webgl')[0];
  const ctx = Canvas(webgl_canvas.width, webgl_canvas.height);
  ctx.fillStyle = 'red';
  ctx.fillText('Sample Text', 50, 100);
}
