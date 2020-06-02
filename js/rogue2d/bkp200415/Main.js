//
window.onload = async function Main() {

  // Debugger.enabled = true;

  const txm = TextureMaster({ srcs: [ ...Data ], tex_w: 128, tex_h: 128, comp_w: 64, comp_h: 64 });
  await txm.ready();

  const tim = TileManager({
    textures: txm.generate('simpleN', 4),
    tiles: [
      { ti: 0, solid: 0 },
      { ti: 1, solid: 1 },
      { ti: 2, solid: 1 },
      { ti: 3, solid: 1 },
    ],
    //tilesize:
  });



  Debugger.memory.forEach((e,i) => console.log(`%c${i} ${e}`, 'background:darkred;color:white;'));



  $('body').append(
    $('<div>Texture pack</div>'),
    (txm.tp.ctx.canvas),
    $('<div>Last composition (buffer)</div>'),
    (txm.tc.bctx.canvas),
    $('<div>Composition pack</div>'),
    (txm.tc.cont.ctx.canvas),
  );


}
