//
function Renderer(g) {


  g.mouse.onmousemove = function (e) {
    if (this.buttons[0]) {
      if (this.dy < 0 && g.camera.pitch < +Math.PI / 2
      ||  this.dy > 0 && g.camera.pitch > -Math.PI / 2)
      {
        g.camera.pitch -= this.dy * 0.005;
      }
      g.camera.yaw -= this.dx * 0.005;
    }
  };


  g.render();

}
