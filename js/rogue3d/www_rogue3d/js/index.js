//
window.onload = async function () {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = 256;
  ctx.canvas.height = ctx.canvas.width * 0.75;
  // ctx.imageSmoothingEnabled = false;
  document.body.appendChild(ctx.canvas);

  const aspect_ratio = ctx.canvas.width / ctx.canvas.height;
  resize_window();
  window.onresize = resize_window;

  console.log(`%c Raycaster.v4 (${ctx.canvas.width} x ${ctx.canvas.height})`, 'color:blue');

  // pointer lock
  ctx.canvas.onclick = function () {
    ctx.canvas.requestPointerLock();
  }
      // document.addEventListener("mousemove", onmousemove, false);

  // Hook pointer lock state change events for different browsers
  document.addEventListener('pointerlockchange', function() {
    if(document.pointerLockElement === ctx.canvas) {
      document.addEventListener("mousemove", onmousemove, false);
    } else {
      document.removeEventListener("mousemove", onmousemove, false);
    }
  }, false);



  // Resizing window.
  function resize_window() {
    const {width, height} = document.body.getBoundingClientRect();
    if (width / height > aspect_ratio) {
      ctx.canvas.style.width  = 'auto';
      ctx.canvas.style.height = height;
    } else {
      ctx.canvas.style.width  =  width;
      ctx.canvas.style.height = 'auto';
    }
  }


  // Map.
  const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
    [1,0,0,1,0,1,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,1,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [0,0,0,1,0,1,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];


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


  const textures = await load_textures([
    FLOOR_IMG_DATA,
    WALL_IMG_DATA,
    //'https://avatars.mds.yandex.net/get-pdb/1642325/6602208b-31de-49df-adf1-51ef93a5cbac/s1200?webp=false',
    //'https://yandex.ru/images/_crpd/GWML6d667/185edeKjN4E/N74dv6GSovO-dmqtBTkw_yU62NDX_pzGdMRhcmU0rVk1dPm1V9n-R0vdItIVyBUZ-LCM4I0rFFevhRL3idqbljM9HTk0Ane2P2buK0c5IT9nrs_Fwq9KhLUFZfIkMrrcQ',
  ], 128, 128);


  // Sets up raycaster scene.
  Raycaster.setup({ map, textures, camera_opt: [[9, 9], -1.5, 0.2, 0.01] });


  // Keyboard.
  const keys = {};
  window.onkeyup = e => keys[e.code] = false;
  window.onkeydown = e => keys[e.code] = true;
  function keyboard() {
    // movement
    let dx = 0, dy = 0;
    if (keys['KeyA']) {
      dx -= Raycaster.camera.plane_x * Raycaster.camera.move_speed;
      dy -= Raycaster.camera.plane_y * Raycaster.camera.move_speed;
    }
    if (keys['KeyD']) {
      dx += Raycaster.camera.plane_x * Raycaster.camera.move_speed;
      dy += Raycaster.camera.plane_y * Raycaster.camera.move_speed;
    }
    if (keys['KeyW']) {
      dx += Raycaster.camera.dir_x * Raycaster.camera.move_speed;
      dy += Raycaster.camera.dir_y * Raycaster.camera.move_speed;
    }
    if (keys['KeyS']) {
      dx -= Raycaster.camera.dir_x * Raycaster.camera.move_speed;
      dy -= Raycaster.camera.dir_y * Raycaster.camera.move_speed;
    }
    if (dx || dy) {
      [Raycaster.camera.pos_x, Raycaster.camera.pos_y] =
        Raycaster.collision(Raycaster.camera.pos_x, Raycaster.camera.pos_y, dx, dy, 0.2);
    }
  }


  // Mouse.
  function onmousemove(e) {
    const { movementX, movementY } = e;
    Raycaster.camera.rotate(-Raycaster.camera.rot_speed * movementX);
  }


  const sky_img = new Image();
  sky_img.src = SKY_IMG_DATA;
  let sky_x = 0;

  function draw_sky() {
    sky_x+=0.0002;
    // https://yandex.ru/images/search?text=%D0%BD%D0%B5%D0%B1%D0%BE%20360
    const width = ctx.canvas.width * 5.5;
    let angle = Raycaster.camera.rotation+sky_x; if ((angle %= Math.PI*2) < 0) angle += Math.PI*2;
    const sx = 0;
    const sy = 0;
    const sw = sky_img.width;
    const sh = sky_img.height;
    const dx = (angle / (2*Math.PI)) * width;
    const dy = 0;
    const dw = width;
    const dh = ctx.canvas.height / 2;

    ctx.filter = 'hue-rotate(-10deg)';
    ctx.drawImage(sky_img, sx, sy, sw, sh, dx, dy, dw, dh);
    ctx.drawImage(sky_img, sx, sy, sw, sh, dx-width, dy, dw, dh);
    ctx.filter = 'none';
  }







  function render(timestamp=0) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);





    Raycaster.cast_floor(ctx);

    draw_sky();

    Raycaster.cast_walls(ctx);



    keyboard();

    requestAnimationFrame(render);
  }



  render();







}

