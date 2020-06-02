// TODO: http://paulbourke.net/geometry/tiling/
// TODO: https://www.html5rocks.com/en/tutorials/canvas/imagefilters/ (discrete laplace operator)

// Creates texturepack from sources, allows to manipulate
// with compositions, store them, and draw.
function TextureMaster(opt) {
  // Defaults.
  const srcs   = opt.srcs   || [];               // "sources" must be array of base64/urls.
  const tex_h  = opt.tex_h  || opt.tex_w || 16;  // Texture height (original image will be resized)
  const tex_w  = opt.tex_w  || tex_h;            // Texture width
  const comp_h = opt.comp_h || opt.comp_w || 16; // Composition height (texture will be resized)
  const comp_w = opt.comp_w || comp_h;           // Composition width
  const comp_n = opt.comp_n || 16;               // Max compositions number stored in container.
  // Texturepack.
  const tp = _TextureContainer(tex_w, tex_h, srcs.length);
  if (tp == null) throw Error('TextureMaster:: _TextureContainer cannot create tp (too big).');
  const tp_promises = _texturepack(tp, srcs);
  // Texture composition.
  const tc = _TextureComposition(comp_w, comp_h, comp_n, tp);
  // Textures.
  let textures = [];


  // Out.
  return {
    tp,
    tc,
    textures,
    // functions
    ready,
    generate,
  };


  // (Private) Loads images from 'srcs' into 'container' and returns onload-promises.
  function _texturepack(cont, srcs) {
    const promises = []; // All 'onload's will be here.
    for (let i = 0; i < srcs.length; ++i) {
      const image = new Image();
      image.crossOrigin = 'Anonymous';
      image.src = srcs[i];
      promises.push(new Promise((r) => {
        image.onload = () => {
          cont.ctx.drawImage(image, 0, 0, image.width, image.height, ...cont.xywh(i));
          r();
        }
        image.onerror = () => {
          cont.ctx.fillStyle = 'hotpink';
          cont.ctx.fillRect(...cont.xywh(i));
          console.log(`TextureMaster->load:: Cannot be loaded (${i}) "${srcs[i].slice(0,256)}"`);
          r();
        }
      }));
    }
    return promises;
  }


  // Returns whenever texturepack is loaded.
  function ready() {
    return Promise.allSettled(tp_promises);
  }


  // Generates textures using '_generators'.
  function generate(fname, ...args) {
    if (!_TextureGenerators[fname]) throw Error(`TextureMaster->generate:: generator "${fname}" doesn't exist.`);
    return (textures = _TextureGenerators[fname](tc, ...args));
  }
}


// Safely allocates canvas for storing textures and
// gives functions to determine texture coordinates
// and sizes on that canvas.
// Parameters:
// tw     --- One texture width
// th     --- One texture height
// number --- Textures number
function _TextureContainer(tw, th, number) {
  const area = tw*th*number;                  // Canvas area.
  const maxsize = Math.ceil(Math.sqrt(area)); // Maximum width/height.
  const num_x = Math.floor(maxsize / tw);     // Number of textures by x.
  const num_y = Math.ceil(number / num_x);    // Number of textures by y.
  const width = num_x * tw;                   // Canvas width.
  const height = num_y * th;                  // Canvas height.
  // If canvas cannot be created returns null.
  if (width > CANVAS_MAX_SIZE || height > CANVAS_MAX_SIZE || area > CANVAS_MAX_AREA) return null;
  // Creates canvas.
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.height = height;
  ctx.canvas.width = width;


  // Out.
  return {
    number,
    height,
    width,
    xywh,
    ctx,
    xy,
  };


  // Returns coordinates in pixels.
  function xy(i) {
    return [(i%num_x) * tw, (i/num_x|0) * th];
  }


  // Returns coordinates and sizes in pixels.
  function xywh(i) {
    return [...xy(i), tw, th];
  }
}


// Creates composition container using '_TextureContainer'
// and gives functions for manipulate with composition, storing
// into composition container and determine where to each composition
// stored in container.
// Paramenters:
// width   --- composition width (not container!)
// height  --- composition height,
// max_num --- maximum compositions what stored in container,
// tp      --- texturepack from 'TextureMaster'.
function _TextureComposition(width, height, max_num, tp) {
  // Composition buffer.
  const bctx = document.createElement('canvas').getContext('2d');
  bctx.canvas.height = height;
  bctx.canvas.width = width;
  // Compositions container.
  const cont = _TextureContainer(width, height, max_num);


  // Out.
  const self = {
    height,
    width,
    bctx,
    cont,
    // functions
    compose,
    random_filter,
    clear,
    fill,
    push,

  };
  return self;


  // Composes texture from texturepack into composition and returns self.
  function compose({ tindex, scale, angle, operat, filter, offset, alpha }) {
    // Defaults.
    if (null == tindex) tindex = Math.random()*tp.number|0;      // Texture index;
    if (null == scale ) scale  = 1.414+Math.random()*4;          // Texture scale, є [2.0, Inf);
    if (null == angle ) angle  = Math.random()*Math.PI*2;        // Rotation angle, є [0.0, 2PI);
    if (null == operat) operat = _.sample(CANVAS_COMPOSITE);     // Global composite operat;
    if (null == filter) filter = random_filter();                // Image filter (an object);
    if (null == offset) offset = [Math.random(), Math.random()]; // Source coordinates, array(2) of є [0.0, 1.0);
    if (null == alpha ) alpha  = [0.2+Math.random()*0.6];        // Alpha blending, є [0.0, 1.0].
    // Processing.
    bctx.save();
    bctx.translate(+(width>>1), +(height>>1));
    bctx.rotate(angle);
    bctx.translate(-(width>>1), -(height>>1));
    bctx.globalCompositeOperation = operat;
    bctx.globalAlpha = alpha;
    bctx.filter = filter ? [
      null == filter.hue        ? '' : `hue-rotate(${filter.hue}deg)`,
      null == filter.blur       ? '' : `blur(${filter.blur}px)`,
      null == filter.sepia      ? '' : `sepia(${filter.sepia}%)`,
      null == filter.invert     ? '' : `invert(${filter.invert}%)`,
      null == filter.opacity    ? '' : `opacity(${filter.opacity}%)`,
      null == filter.saturate   ? '' : `saturate(${filter.saturate}%)`,
      null == filter.contrast   ? '' : `contrast(${filter.contrast}%)`,
      null == filter.grayscale  ? '' : `grayscale(${filter.grayscale}%)`,
      null == filter.brightness ? '' : `brightness(${filter.brightness}%)`,
    ].join(' ') : 'none';
    {
      // Constants used here:
      //   1.414 ~ 1/sin45;
      //   0.207 ~ (1/sin45-1)/2.
      if (scale < 1.414) scale = 1.414; // Resizing to fit canvas.
      const dx = (offset[0]*(1.414-scale)-0.207)*width;
      const dy = (offset[1]*(1.414-scale)-0.207)*height;
      const dw = scale*width;
      const dh = scale*height;
      bctx.drawImage(tp.ctx.canvas, ...tp.xywh(tindex), dx, dy, dw, dh);
      // Debug.
      Debugger.push('_TextureComposition->compose', {
        tindex,
        scale,
        angle,
        operat,
        filter,
        ctxfilter: bctx.filter,
        offset,
        alpha,
      });
    }
    // End of processing.
    bctx.restore();
    return self;
  }


  // Creates random filter.
  function random_filter(fixed) {
    return {
      hue:        Math.random() < 0.5 ? null : (Math.random()*360|0),
      blur:       Math.random() < 0.5 ? null : (Math.random()*  2|0),
      sepia:      Math.random() < 0.5 ? null : (Math.random()* 50|0),
      invert:     Math.random() < 0.5 ? null : (Math.random()*100|0),
      opacity:    null,
      saturate:   Math.random() < 0.5 ? null : (Math.random()*800|0),
      contrast:   Math.random() < 0.5 ? null : (Math.random()*200|0),
      grayscale:  Math.random() < 0.5 ? null : (Math.random()* 50|0),
      brightness: Math.random() < 0.5 ? null : (Math.random()*200|0),
      ...fixed
    };
  }


  // Clears composition.
  function clear() {
    bctx.clearRect(0, 0, width, height);
    return self;
  }


  // Fills composition with a color.
  function fill(color) {
    bctx.fillStyle = color || 'hotpink';
    bctx.fillRect(0, 0, width, height);
    return self;
  }


  // Draws composition into container.
  function push(index) {
    cont.ctx.drawImage(bctx.canvas, ...cont.xy(index));
    return self;
  }
}


// TODO: animations
// tc      -- _TextureContainer
// indices -- Composition indices in 'tc'
// delay   -- Delay before next composition (for animation)
function _Texture(tc, indices, delay) {
  const xys = indices.map(e => tc.cont.xy(e)); // Buffering compositions positions.
  const height = tc.height;
  const width = tc.width;
  let c_i = 0; // current index


  return {
    height,
    width,
    // functions
    draw,
  }


  //
  function draw(ctx, pos, elapsed) {
    ctx.drawImage(tc.cont.ctx.canvas, ...xys(c_i), width, height, ...pos, width, height);
  }
}


// Generators for 'TextureMaster->generate'.
const _TextureGenerators = {
  simpleN(tc, num) {
    tc.clear();
    for (let i = 1; i < num; ++i) {
      tc.compose({ operat: CANVAS_COMPOSITE[0], alpha: 1.0 })
        .compose({ operat: CANVAS_COMPOSITE[0], alpha: 0.5 })
        .compose({ operat: CANVAS_COMPOSITE[0], alpha: 0.5 })
        .compose({ operat: CANVAS_COMPOSITE[0], alpha: 0.5 })
        .push(i);
    }
    return Array(num).fill().map((_,i) => _Texture(tc, [i], 0));
  },
};
