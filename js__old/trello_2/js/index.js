//
window.onload = function() {


  // constants


  const LOREM = 'massa tincidunt dui ut ornare lectus sit amet est placerat in egestas erat imperdiet sed euismod nisi porta lorem mollis aliquam ut porttitor leo a diam sollicitudin tempor id eu nisl nunc mi ipsum faucibus vitae aliquet nec ullamcorper sit amet risus nullam eget felis eget nunc lobortis mattis aliquam faucibus purus in massa tempor nec feugiat nisl pretium fusce id velit ut tortor pretium viverra suspendisse potenti nullam ac tortor vitae purus faucibus ornare suspendisse sed nisi lacus sed viverra tellus in hac habitasse platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras tincidunt lobortis feugiat vivamus at'
    .split(' ');

  const lorem = (max=50) => Array(2 + Math.random() * max | 0).fill().map(_ => LOREM[Math.random() * LOREM.length | 0]).join(' ');


  // layout


  $('body').append(
    $('<canvas class="canvas"></canvas>'),
    $.div('container').append(
      $.div('editor').append(
        $.div('textarea disc').attr('contenteditable','true').attr('placeholder','text'),
        $.div('foot').append(
          $.div('textarea name').attr('contenteditable','true').attr('placeholder','title'),
          $.div('button').html('Send')
        )
      ),
      Array(10).fill().map((e,i,a) =>
        $.div('card').append(
          $.div('title').append(
            $.div('name').html('· '+lorem(5)),
            $.div('link').html(`[<a href="https://google.com">@</a>]`),
          ),
          $.div('body').html(decorate_desc(lorem())),
          $.div('foot').append(
            $.div('date').html('01.01.2020 date here')
          )
        )
      )
    )
  );


  let life_id = game_of_life();
  window.onresize = () => {
    clearInterval(life_id);
    life_id = game_of_life();
  }


  // functions


  function decorate_desc(s) {
    const min = 0x50;
    const max = 0xff;
    const sep = s.replace(/[^\W_]/g, '').split('');
    return s.split(/[\W_]/).map((e,i) =>
      (e.length ? `<span style="color:#${Math.min(min+(e.length<<4),max).toString(16).repeat(3)}">${e}</span>` : e) + sep[i]
    ).join('');
  }


  function game_of_life() {
    const size = 20;

    const body_rect = $('body').toArray()[0].getBoundingClientRect();
    const container_rect = $('.container').toArray()[0].getBoundingClientRect();
    const side_width = Math.ceil((body_rect.width - container_rect.width) / 2);

    if (side_width < size << 2) return null;

    const cell_width = Math.ceil(side_width * 2 / size);
    const container_num = Math.ceil(container_rect.width / cell_width);
    const canvas_width = size + container_num;
    const canvas_height = Math.ceil(body_rect.height / cell_width);
    const left_side_x = Math.ceil(side_width / cell_width);
    const right_side_x = canvas_width - left_side_x - 1;

    const ctx = $('.canvas').toArray()[0].getContext('2d');
    ctx.canvas.width = canvas_width;
    ctx.canvas.height = canvas_height;
    ctx.fillStyle = '#78465222';

    const map = Array(size).fill().map(_ => Array(size).fill().map(_ => (Math.random()<0.5)|0));
    const dumpmap = Array(size).fill().map(_ => Array(size).fill());

    proc();
    return setInterval(proc, 100);


    function proc() {
      step();
      draw();
    }


    function draw() {
      ctx.clearRect(0, 0, canvas_width, canvas_height);

      let x = 0;
      for (let _x = 0; _x < canvas_width; ++_x) {
        if (_x > left_side_x && _x < right_side_x) continue;

        for (let _y = 0; _y < canvas_height; ++_y) {
          const y = _y % size;
          if (map[x][y]) ctx.fillRect(_x, _y, 1, 1);
        }

        x = Math.min(x + 1, size - 1);
      }

    }


    function step() {
      dump();
      for (let x = 0; x < size; ++x) for (let y = 0; y < size; ++y) {
        const num =
          get(x-1, y-1)+get(x+0, y-1)+get(x+1, y-1)+
          get(x-1, y+0)+              get(x+1, y+0)+
          get(x-1, y+1)+get(x+0, y+1)+get(x+1, y+1);
        if (map[x][y] === 1 && (num < 2 || num > 3)) map[x][y] = 0;
        else if (map[x][y] === 0 && (num === 3)) map[x][y] = 1;
      }
    }


    function get(x, y) {
      if (x < 0) x = size + x; else if (x >= size) x = x - size;
      if (y < 0) y = size + y; else if (y >= size) y = y - size;
      return dumpmap[x][y];
    }


    function dump() {
      for (let x = 0; x < size; ++x) for (let y = 0; y < size; ++y) dumpmap[x][y] = map[x][y];
    }
  }

}
