window.onload = function () {

  const render = Render();
  const mouse = Mouse(render.ctx);

  const { width, height } = render.sizes();

  const name = [...Array(~~(Math.random() * 5) + 3)]
    .map(e => String.fromCharCode('a'.charCodeAt(0) + ~~(Math.random() * 26))).join('');

  render.start((ctx, elapsed) => {

    mouse.draw(ctx);

    ctx.fillStyle = 'red';
    ctx.fillText(`hello, ${name}`, width / 3, height / 2 - 20);

  });


}
