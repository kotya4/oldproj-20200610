
function CanvasRenderer(width, height, antialiasing = false, parent = document.body) {

  const ctx = create_context2d(width, height, antialiasing);
  const shader = create_context2d(width, height, antialiasing);

  parent.appendChild(ctx.canvas);



  function create_context2d(width, height, antialiasing = false) {
    const cvs = document.createElement('canvas');
    cvs.width = width;
    cvs.height = height;
    const ctx = cvs.getContext('2d');
    ctx.imageSmoothingEnabled = antialiasing;
    return ctx;
  }





  return {
    ctx,
    shader,
  }
}
