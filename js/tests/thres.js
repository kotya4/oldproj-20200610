//
window.onload = function() {

  // const chain = Markov([[1,2], [3,4], [1,2], [3,4], [5,6], [7,8]], 2);
  // console.log(chain);
  // return;

  /// layout

  $('body').append(
    $('<div class="container"></div>'),
    $('<input type="file" class="file" name="file" />'),
  );

  /// file was choosen

  $('.file')[0].onchange = function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const url = window.URL.createObjectURL(file);

    $('.container').empty().append(
      $('<img class="image"></img>'),
      $('<div class="status">converting...</div>'),
      $('<canvas class="canvas" width="128" height="128"></canvas>'),
      $('<canvas class="output" width="128" height="128"></canvas>'),
    );

    const image = $('.image')[0];
    const canvas = $('.canvas')[0];

    image.src = url;
    image.onload = function () {
      canvas.height = image.height;
      canvas.width = image.width;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, ctx.canvas.width, ctx.canvas.height);

      // $('.image').css({ width: 128 }); // call only after drawImage

      $('.status').html('convert_image: in progress');
      convert_image(ctx);
      $('.status').html('convert_image: done');
    }
  }


  function convert_image(ctx) {
    const idata = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

    const source = [];

    for (let i = 0; i < idata.data.length; i += 4) {
      const r = idata.data[0+i];
      const g = idata.data[1+i];
      const b = idata.data[2+i];

      source.push([r,g,b]);
    }

    // ctx.putImageData(idata, 0, 0);

    const chain = Markov(source, 4);
    console.log(chain);

    $('.image')[0].onclick = function () {
      $('.status').html('put_image_from_markov: in progress');
      put_image_from_markov(chain);
      $('.status').html('put_image_from_markov: done');
    }
  }


  function put_image_from_markov(mchain) {
    console.log('put_image_from_markov');

    const { chain, dictionary, len } = mchain;

    const image = $('.image')[0];
    const output = $('.output')[0];

    output.height = image.height;
    output.width = image.width;
    const ctx = output.getContext('2d');

    const idata = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

    // random node key
    const keys = Object.keys(chain);
    let key = keys[Math.random()*keys.length|0];

    for (let i = 0; i < idata.data.length; i += 4) {
      const node = chain[key];
      const raw = dictionary[~~key.split(',')[0]]||'0,0,0';
      // console.log(raw);
      const rgb = raw.split(',');
      idata.data[0+i] = rgb[0];
      idata.data[1+i] = rgb[1];
      idata.data[2+i] = rgb[2];
      idata.data[3+i] = 255;

      if (node.length < 1) {
        key = keys[Math.random()*keys.length|0];
      } else {
        let acc = Math.random()*node.appears_max;
        let child_index = 0;
        for (let child of node) {
          acc -= child.appears;
          if (acc <= 0) break;
          ++child_index;
        }
        key = node[child_index].key;
      }
    }

    ctx.putImageData(idata, 0, 0);
  }




}
