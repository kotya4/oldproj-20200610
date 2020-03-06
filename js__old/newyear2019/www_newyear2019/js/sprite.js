
function Sprite(...args) {
  for (let i = args.length; i < 4; ++i) args.push(null);
  let tileset   = args[0];
  let frames    = args[1];
  let animation = args[2];
  let mirror    = args[3];

  //console.log(tileset.name);

  mirror = !!mirror;

  if (!frames) throw new Error(`in sprite "${tileset.name}" no frames provided`);
  else if (Number.isInteger(frames)) frames = [...Array(frames)].map((e,i) => i);
  
  frames = frames.map(index => {
    const w = tileset.sizes[0];
    const h = tileset.sizes[1];
    const iw = tileset.img.width;
    const ox = (iw / w - (iw / w | 0)) * w;
    const x = index * w % (iw - ox);
    const y = (index / (iw / w | 0) | 0) * h;
    return { index, x, y, w, h }
  });

  function create_animation(o) {
    return Object.assign({
      time: 0,
      speed: 100,
      looped: true,
      stopped: false,
      current_frame: 0
    }, o || {});
  }

  if (!animation) animation = create_animation({ speed: 0, stopped: true });
  else if ('number' === typeof animation) animation = create_animation({ speed: animation });
  else animation = create_animation(animation);
  
  function draw_on(ctx, x, y, block_size = 16) {
    if (!animation.stopped && animation.speed <= (animation.time += 1)) {
      animation.time = 0;
      if (++animation.current_frame >= frames.length)
        animation.current_frame = (animation.stopped = !animation.looped) ? frames.length - 1 : 0;
    }
    const f = frames[animation.current_frame];
    x = x * block_size + ((block_size - f.w) >> 1);
    y = y * block_size + (block_size - f.h);
    if (mirror) {
      ctx.save();
      ctx.translate(x | 0, y | 0);
      ctx.scale(-1, 1);
      ctx.drawImage(tileset.img, f.x, f.y, f.w, f.h, 0, 0, -f.w, f.h);
      ctx.restore();
    }
    else ctx.drawImage(tileset.img, f.x, f.y, f.w, f.h, x | 0, y | 0, f.w, f.h);
  }
  
  function copy(...a) {
    return Sprite(...args.map((e,i) => !a || i >= a.length || a[i] == null ? e : a[i]));
  }

  return {
    tileset,
    frames,
    animation,
    draw_on,
    copy
  }
}