/*
 * Simple 2d canvas.
 */
function Canvas2d(screen_width, screen_height, parent) {
  // glMatrix requires

  const { vec3, mat4 } = glMatrix;

  // creating context2d

  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = screen_width;
  ctx.canvas.height = screen_height;
  ctx.canvas.imageSmoothingEnabled = false;
  (parent || document.body).appendChild(ctx.canvas);

  return ctx;
}
