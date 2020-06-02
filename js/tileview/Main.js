//
window.onload = async function Main() {

  let W = window.innerWidth, H = window.innerHeight;

  window.addEventListener('resize', function () {
    W = window.innerWidth;
    H = window.innerHeight;
    $('.statusbar .display').html(`${W}x${H}`);
  });

  console.log(`%cInitial display size ${W}x${H}`, 'color:lightblue');




  $('body').append(
    $.div('statusbar').append(

      $.div('display').html(`${W}x${H}`),

      $.div('selector'),

    ),

    $('<input>')
      .attr({ class: 'viewer input', type: 'file', multiple: 'multiple' })
      .on('change', function (e)
    {
      console.log(`%cLoaded from files!`, 'color:yellow');
      const { names, images, promises } = load_images_from_files(e.target.files);
      Promise.all(promises).then(_ => viewer.reinit(images, names));
      // $('viewer input').css({ display: 'none' });
    }),

    $.div('viewer container').append(
      $('<canvas>').attr({ class: 'viewer images', width: 0, height: 0 }),
      $('<canvas>').attr({ class: 'viewer overlay', width: 0, height: 0 }),
    ),
  );




  function load_images_from_files(files) {
    const names = [];
    const images = [];
    const promises = [];
    for (let file of files) {
      if (file.type.indexOf('image') < 0) { // not an image ?
        console.log(`load_images_from_files:: ${file.name} is not an image.`);
        continue;
      }
      const image = new Image();
      names.push(file.name);
      images.push(image);
      promises.push(new Promise(r => image.onload = r));
      // Reads file as image.
      const reader = new FileReader();
      reader.onload = () => image.src = reader.result;
      reader.readAsDataURL(file);
    }
    console.log(`load_images_from_files:: ${images.length} image(s) proceed.`);
    return { names, images, promises };
  }



  function load_images_from_base64(sources) {
    const images = [];
    const promises = [];
    for (let src of sources) {
      const image = new Image();
      images.push(image);
      promises.push(new Promise(r => image.onload = r));
      // Loads image as base64.
      image.src = src;
    }
    console.log(`load_images_from_base64:: ${images.length} image(s) proceed.`);
    return { images, promises };
  }





  const selector = {

    rect: [-1, -1, -1, -1],
    updating: false,

    draw(ctx) {
      if (!this.updating) return;
      ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
      ctx.fillRect(...this.rect);
    },

    update(x, y) {
      this.rect[2] = x - this.rect[0];
      this.rect[3] = y - this.rect[1];
      $('.statusbar .selector').html(`${this.rect}`);
    },

    normalize() {
      if (this.rect[2] < 0) { this.rect[2] = -this.rect[2]; this.rect[0] -= this.rect[2]; }
      if (this.rect[3] < 0) { this.rect[3] = -this.rect[3]; this.rect[1] -= this.rect[3]; }
      $('.statusbar .selector').html(`${this.rect}`);
      return this.rect[2] > 10 && this.rect[3] > 10;
    },

  };






  const viewer = {
    imgoffset: 10, // image offset top

    ictx: $('.viewer.images')[0].getContext('2d'),  // images
    octx: $('.viewer.overlay')[0].getContext('2d'), // borders and selector

    selector: selector,

    imgnames: [], // drawn on overlay
    images: null,

    // Sets new sizes.
    set_sizes(w, h) {
      this.ictx.canvas.height = this.octx.canvas.height = h;
      this.ictx.canvas.width = this.octx.canvas.width = w;
    },


    // Redraws overlay.
    redraw() {
      const ctx = this.octx;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      // TODO: draw borders

      // Draws images names.
      const font_size = Math.min(12, this.imgoffset-1);
      ctx.font = `${font_size}px "Lucida Console", Monaco, monospace`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      for (let imgname of this.imgnames) {
        ctx.fillText(imgname.name, 2, imgname.y + font_size + 1);
      }
      // Draws selector.
      this.selector.draw(ctx);
    },


    // Resizes canvases and draws provided images.
    reinit(images, names, update_storage = true) {
      let max_height = 0;
      let max_width = 0;

      this.imgnames.length = 0;
      this.images = images;

      for (let image of images) {
        max_height += image.height + this.imgoffset;
        max_width = Math.max(image.width, max_width);
      }

      if (max_height <= 0 || max_width <= 0) {
        console.log('viewer.reinit:: Canvas has incorrect size ( maybe no images provided? )');
        max_height = max_width = 100;
      }

      this.set_sizes(max_width + 20, max_height + 20);

      let y = 0;
      for (let i = 0; i < images.length; ++i) {
        y += this.imgoffset;
        this.ictx.drawImage(images[i], 0, y);
        this.imgnames.push({ y, name: names[i] || 'unnamed' });
        y += images[i].height;
      }

      this.redraw();

      // Saves new information.
      if (update_storage) this.save_to_storage();
    },


    save_to_storage() {
      const dump = JSON.stringify({
        imgnames: this.imgnames.map(e => e.name),
        imgoffset: this.imgoffset,
        imgsources: this.images.map(e => e.src),
        container_rect: $('.viewer.container')[0].getBoundingClientRect(),
      });
      localStorage.setItem('tileview', dump);
      console.log(`%cSaved! (${dump.length*2} bytes)`, 'color:green');
    },


    load_from_storage() {
      const dump_raw = localStorage.getItem('tileview');
      const dump = JSON.parse(dump_raw);
      if (dump) {
        console.log(`%cLoaded from storage! (${dump_raw.length*2} bytes)`, 'color:yellow');
        const { images, promises } = load_images_from_base64(dump.imgsources);
        Promise.all(promises).then(_ => this.reinit(images, dump.imgnames, false));
        if (null !== dump.imgoffset) this.imgoffset = dump.imgoffset;
        if (null !== dump.container_rect) $('.viewer.container').css({
          width: dump.container_rect.width,
          height: dump.container_rect.height,
        });
      }
      return !!dump;
    },


  };


  // Loads information from localstorage, overwise initializes from scratch.
  if (!viewer.load_from_storage()) {
    console.log('%cInitialized! (test image used)', 'color:yellow');
    const { images, promises } = load_images_from_base64([Utils.test_img]);
    Promise.all(promises).then(_ => viewer.reinit(images, []));
  }





  $('body').on('click', function (e) {
    // console.log('click', e);
  });














  $('body').on('mousedown', function (e) {


    if (e.target === viewer.octx.canvas) { // clicked on viewer?
      // pointer coordinates
      const rect = viewer.octx.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (e.button === 0) { // is left click?
        selector.rect[0] = ~~x;
        selector.rect[1] = ~~y;
        selector.update(...selector.rect);
        selector.updating = true;
      }

    }

  });



  $('body').on('mousemove', function (e) {

    if (e.target === viewer.octx.canvas) { // pointing on viewer?
      // pointer coordinates
      const rect = viewer.octx.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Updates selector.
      if (selector.updating) {
        selector.update(~~x, ~~y);
        viewer.redraw();
      }
    }

  });





  $('body').on('mouseup', function (e) {

    // Applies selector.
    if (selector.updating) {
      selector.updating = false;
      if (!selector.normalize()) {
        console.log('Selector too small.');
      }



      viewer.redraw();
    }



  });






















}
