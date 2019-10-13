//
function Canvas(screen_width, screen_height, parent, class_name) {
  parent = parent || document.body;
  class_name = class_name || 'canvas';

  const canvas = document.createElement('canvas');
  canvas.width = screen_width;
  canvas.height = screen_height;
  canvas.classList.add(class_name);
  canvas.imageSmoothingEnabled = false;
  parent.appendChild(canvas);

  return canvas.getContext('2d');
}
