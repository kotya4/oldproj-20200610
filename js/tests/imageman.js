//
window.onload = async function() {


  {
    const scaler = 10;
    const ctx = document.createElement('canvas').getContext('2d');
    document.body.appendChild(ctx.canvas);
    ctx.canvas.height = 400;
    ctx.canvas.width = 400;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 400, 400);

    const tw = 2;
    const th = 3;
    const tnum = 10;

    const area = tw*th*tnum;
    const maxsize = Math.ceil(Math.sqrt(area));
    const numx = Math.floor(maxsize / tw);
    const numy = Math.ceil(tnum / numx);


    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, numx*tw*scaler, numy*th*scaler);



    function xy(index) {
      return [
        (index % numx) * tw,
        (index / numx | 0) * th,
      ];
    }


    const colors = Array(tnum).fill().map(_ => `rgb(${Math.random()*256|0},${Math.random()*256|0},${Math.random()*256|0})`);





    for (let i = 0; i < tnum; ++i) {

      const [x,y] = xy(i);
      ctx.fillStyle = colors[i];
      ctx.fillRect(x*tw*scaler, y*th*scaler, tw*scaler-1, th*scaler-1);
      ctx.fillStyle = 'white';
      ctx.fillText(i, x*tw*scaler, (y+1)*th*scaler);

    }



  }






  return;



  // IMAGE man


  const RANDOM = Array(256).fill().map(Math.random);
  let random_next_i = 0;
  function random_next(ii) { return RANDOM[((ii||random_next_i++)*100|0)%RANDOM.length]; }



  // Loads images and saves scaled verions into canvas.
  async function load_textures(urls, width, height) {
    // allocate memody for all textures (as one big canvas)
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height * urls.length;
    const context = canvas.getContext('2d');
    const number = urls.length;
    // all images 'onload' promises will be here
    const promises = [];
    // load images and save into 'textures'
    for (let i = 0; i < number; ++i) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = urls[i];
      promises.push(new Promise((res) => {
        img.onload = () => {
          context.drawImage(img, 0, 0, img.width, img.height, 0, i * height, width, height);
          res();
        }
        img.onerror = () => {
          context.fillStyle = 'hotpink'; // error color
          context.fillRect(0, i * height, width, height);
          console.log(`create_texture_data:: [${i}]:${urls[i]} cannot be loaded`);
          res();
        }
      }));
    }
    await Promise.all(promises);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    return { width, height, canvas, data, number };
  }


  const tsize = 128;
  const images_num = 5;
  const textures = await load_textures(Array(images_num).fill().map((_,i)=> `https://picsum.photos/${tsize}/${tsize}?${i}`), tsize, tsize);
  let cvs = textures.canvas;



  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = 300;
  ctx.canvas.height = 300;
  document.body.appendChild(ctx.canvas);
  ctx.canvas.style.position = 'absolute';
  ctx.canvas.style.top = '0';
  ctx.canvas.style.left = '0';
  ctx.canvas.style.width = '1200px';
  // ctx.fillStyle = 'black';
  // ctx.fillRect(0, 0, 300, 300);


  const out_len = 20;
  const out = document.createElement('canvas').getContext('2d');
  out.canvas.width = 90;
  out.canvas.height = 90 * out_len;
  document.body.appendChild(out.canvas);

  let QLEN;
  for (let i = 0; i < out_len; ++i) {
    QLEN = gen_(i);
  }
  console.log(QLEN);

  // animation
  let a_flip = false;
  let anim_i = 0;
  setInterval(_=>{

    if (!a_flip) {
      anim_i++;
      if (anim_i >= out_len - 1) {
        a_flip = true;

      }
    }else{
      anim_i--;
      if (anim_i <= 0) {
        a_flip = false;

      }
    }



    // ctx.drawImage(out.canvas, ...[0, anim_i*90, 90/2, 90/2], ...[0, 0, 90/2, 90/2]);
    // ctx.save();
    // ctx.scale(-1, 1);
    // ctx.drawImage(out.canvas, ...[0, anim_i*90, 90/2, 90/2], ...[-90/2, 0, -90/2, 90/2]);
    // ctx.restore();


    // ctx.save();
    // ctx.scale(16, 16);
    ctx.drawImage(out.canvas, ...[0, anim_i*90, 90, 90], ...[0, 0, 90, 90]);
    // ctx.restore();





  }, 100);











  function gen_(out_i = 0) {

    random_next_i = 0;
    ctx.clearRect(0, 0, 300, 300);

    for (let i = 0; i < images_num; ++i) {

      let scaler = 1 + random_next()*5;

      ctx.save();
      // let s = 60;
      // const rr = [random_next()*s-s/2|0, random_next()*s-s/2|0];
      const t = [tsize/2,tsize/2];
      ctx.translate(...t);
      ctx.rotate(random_next()*Math.PI*2);
      // ctx.rotate(Math.PI*2*(out_i/out_len));
      ctx.translate(-t[0], -t[1]);

      const composites = [ 'source-in','source-out','source-atop','destination-over','destination-in','destination-out',
                          'destination-atop', 'lighter', 'xor', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
                          'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue',
                          'saturation', 'color', 'luminosity'];
      // ctx.globalCompositeOperation = composites[random_next()*composites.length|0];
      ctx.globalCompositeOperation = composites[11];
      // with hue rotation works: 9 (cool), 11, 12 (очень круто), 13 (не всегда работает),
      // 15 (with two images - the best), 16, 17, 18 (very cool), 19 (meh...)

      const filters = [`blur(${random_next()*10|0}px)`, `saturate(${random_next()*100|0}%)`, `sepia(${random_next()*100|0}%)`,
                      `opacity(${random_next()*100|0}%)`, `invert(${random_next()*100|0}%)`, `hue-rotate(${random_next(out_i/out_len)*360|0}deg)`,
                      `grayscale(${random_next()*100|0}%)`, `contrast(${random_next()*100|0}%)`, `brightness(${random_next()*100|0}%)`];

      // ctx.filter = [...(new Set(Array(random_next()*5|0).fill().map(_=> random_next()*filters.length|0)))].map(i=>filters[i]).join(' ');
      // ctx.filter = filters[5];
      ctx.filter = filters[5];

      console.log(i, ctx.globalCompositeOperation, ctx.filter, scaler);

      const sx = random_next(out_i/out_len)*(tsize-tsize*scaler);
      const sy = random_next(out_i/out_len)*(tsize-tsize*scaler);

      ctx.drawImage(cvs, 0, i*tsize, tsize, tsize, sx, sy, tsize*scaler, tsize*scaler);
      // ctx.drawImage(cvs, 0, i*tsize, tsize, tsize, 0+tsize*(1-scaler)/2, 0+tsize*(1-scaler)/2, tsize*scaler, tsize*scaler);
      // ctx.drawImage(cvs, 0, i*128, 128, 128, 0, 0, 128, 128);

      ctx.restore();


    }

    const quadlen = tsize*Math.sin(Math.PI/4) | 0;
    // console.log('max size:' + quadlen);
    // ctx.globalCompositeOperation = 'destination-in';
    // ctx.fillStyle = 'white';
    // ctx.fillRect((tsize-quadlen)/2, (tsize-quadlen)/2, quadlen, quadlen);

    const source_args = [(tsize-quadlen)/2, (tsize-quadlen)/2, quadlen, quadlen];
    const dest_args = [0, out_i * quadlen, quadlen, quadlen];

    out.drawImage(ctx.canvas, ...source_args, ...dest_args);

    return quadlen;
  }




}
