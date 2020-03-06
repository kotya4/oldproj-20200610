
(function() {
  //console.log('\n'.charCodeAt(0));
  function onload() {

    const kb = px.utils.create_keyboard();

    const canvas = new px.Canvas();

    
    const platforms = [
      new px.Platform(0, canvas.get_width(), 0, { transparent: true, ceiling: true }),
      new px.Platform(0, canvas.get_width(), canvas.get_height(), { transparent: true }),

      new px.Platform(0, canvas.get_width(), canvas.get_height() - 10),

      // chamber for crazy
      new px.Platform(200, 250, 30, { ceiling: true }),
      new px.Platform(200, 250, 50, { ceiling: true }),

    ];

    const walls = [
      new px.Wall(0, 0, canvas.get_height(), { transparent: true }),
      new px.Wall(canvas.get_width(), 0, canvas.get_height(), { transparent: true }),
      

      // chamber for crazy
      new px.Wall(200, 30, 50),
      new px.Wall(250, 30, 50),


    ];

    const pixel = new px.Creature({
      position: { x: 220, y: 80 },
      platforms: platforms,
      walls: walls,
      color: 'red',
    });


    const crazy = new px.Creature({
      position: { x: 220, y: 40 },
      platforms: platforms,
      walls: walls,
    });


    const box = new px.RotatingBox();


    const crazy_keys = [
      { key: 'right', min: 100, max: 200, },
      { key: 'left', min: 100, max: 200, },
      { key: 'jump', min: 50, max: 100, },
    ];
    let crazy_current = null;
    function crazy_get_key() {
      if (crazy_current) {
        return crazy_current.key;
      } else {
        crazy_current = crazy_keys[Math.random() * crazy_keys.length | 0];
        const time = crazy_current.min + (Math.random() * crazy_current.max | 0);
        setTimeout(() => { crazy_current = null; }, time);
      }
    }

    const flying_figure = new px.FlyingFigure({
      points_count: 10,
    });


    const golem_city = new px.GolemCity({
      boundaries: [canvas.get_width(), canvas.get_height()],
      center: [canvas.get_width() * 2 / 3, canvas.get_height() - 10],
    });
    
    const scroll = new px.Scroll({
      refs: [px.Creature, px.Canvas, onload],
      color: 'rgba(100, 100, 100, 0.2)',
    });


    px.BlinkingText = function() {

      const text = 'this is text'.replace(/\n+/g, ' ');
      const frequency = 4;
      const text_color = 'white';
      const line_color = 'black';
      const pos = [100, 60];
      const offset = { x: [-50, +50], y: [-50, +50] };
      let blink_delay = 50;
      let blinking = true;
      let jump_delay = 1;
      let jumping = true;

      const height = px.utils.text.symbol_height;
      const width = text.length * (px.utils.text.symbol_width + 1);
      const lines = [...Array(height)];
      const spos = [0, 0];
      let blink_timer = 0;
      let jump_timer = 0;

      this.proc = function(elapsed) {
        if (jumping && (jump_timer += elapsed) >= jump_delay) {
          jump_timer = 0;
          spos[0] = px.utils.rand(offset.x[0], offset.x[1]);
          spos[1] = px.utils.rand(offset.y[0], offset.y[1]);
        }
        if (blinking && (blink_timer += elapsed) >= blink_delay) {
          blink_timer = 0;
          lines.fill(false);
          for (let i = 0; i < px.utils.rand(frequency); ++i)
            lines[px.utils.rand(height)] = true;
        }
      }

      this.draw = function(ctx) {
        ctx.fillStyle = text_color;
        px.utils.text.print(ctx, text, pos[0] + spos[0], pos[1] + spos[1]);
        if (blinking) {
          ctx.fillStyle = line_color;
          ctx.beginPath();
          for (let i = 0; i < height; ++i)
            if (lines[i])
              ctx.rect(pos[0] + spos[0], pos[1] + spos[1] + i, width, 1);
          ctx.fill();
        }
      }

      this.set_jumping = function(flag, delay = null) {
        jumping = flag; if (delay !== null) jump_delay = delay;
      }
      this.set_blinking = function(flag, delay = null) {
        blinking = flag; if (delay !== null) blink_delay = delay;
      }
    }

    const blinking_text = new px.BlinkingText();


    px.Conway = function() {
      const colors = ['#9b497b', '#93356e', '#511a3c', '#603a52'];
      const box_sizes = [100, 100];
      const sizes = [100, 100];
      const delay = 50;
      const pos = [100, 50];
      const reborn_delay = 2000;
      
      if (sizes[0] > box_sizes[0]) sizes[0] = box_sizes[0];
      if (sizes[1] > box_sizes[1]) sizes[1] = box_sizes[1];
      const psizes = Array.from(box_sizes).map((e,i) => e / sizes[i] | 0);
      const map = [...Array(sizes[0])].map(e => [...Array(sizes[1])]
        .map(e => px.utils.rand(2) ? 1 + px.utils.rand(colors.length) : 0));
      let timer = 0;
      let reborn_timer = 0;
      let all_dead = false;

      function alive(x, y) {
        if (x < 0) x = sizes[0] + x;
        else if (x >= sizes[0]) x = x - sizes[0];
        if (y < 0) y = sizes[1] + y;
        else if (y >= sizes[1]) y = y - sizes[1];
        return !!map[x][y] | 0;
      }

      function do_step() {
        let alive_count = 0;
        for (let x = 0; x < map.length; ++x)
          for (let y = 0; y < map[0].length; ++y) {
            const count = 
              alive(x - 1, y - 1) +
              alive(x - 0, y - 1) +
              alive(x + 1, y - 1) +
              alive(x - 1, y - 0) +
              alive(x + 1, y - 0) +
              alive(x - 1, y + 1) +
              alive(x - 0, y + 1) +
              alive(x + 1, y + 1) ;
            if (map[x][y] === 0 && count === 3) {
              map[x][y] = 1 + px.utils.rand(colors.length);
              ++alive_count;
            }
            else if (map[x][y] !== 0 && (count > 3 || count < 2))
              map[x][y] = 0;
          }
        if (alive_count < 3)
          all_dead = true;
      }

      function draw_color(ctx, color_index) {
        ctx.fillStyle = colors[color_index];
        ctx.beginPath();
        for (let x = 0; x < map.length; ++x)
          for (let y = 0; y < map[0].length; ++y)
            if (map[x][y] - 1 === color_index)
              ctx.rect(pos[0] + x * psizes[0], pos[1] + y * psizes[1], psizes[0], psizes[1]);
        ctx.fill();
      }

      this.proc = function(elapsed) {
        if ((timer += elapsed) >= delay) {
          timer = 0;
          do_step();
        }
        if (all_dead && (reborn_timer += elapsed) >= reborn_delay) {
          reborn_timer = 0;
          all_dead = false;
          for (let x = 0; x < map.length; ++x)
            for (let y = 0; y < map[0].length; ++y)
              map[x][y] = px.utils.rand(2) ? 1 + px.utils.rand(colors.length) : 0;
        }
      }

      this.draw = function(ctx) {
        colors.forEach((e,i) => draw_color(ctx, i));
      }

    }

    const conway = new px.Conway();

    canvas.render_fast((ctx, elapsed) => {
      conway.proc(elapsed);
      conway.draw(ctx);
    });


    /*
    canvas.render_fast((ctx, elapsed) => {
      if (canvas.secs_between(0, 4.5, null)) {
        if (canvas.secs_between(0.5, null, 0)) {
          blinking_text.set_blinking(true, 50);
          blinking_text.set_jumping(false);
        }
        blinking_text.proc(elapsed);
        blinking_text.draw(ctx);
        if (canvas.secs_between(4, null, 1)) {
          blinking_text.set_blinking(true);
          blinking_text.set_jumping(true);
        }
      }      
    });
    */


    /*
    canvas.render_fast((ctx, elapsed) => {
      scroll.proc(elapsed);
      scroll.draw(ctx);
      golem_city.draw(ctx);
      if (kb.jump) pixel.jump();
      if (kb.left) pixel.accelerate(-1);
      if (kb.right) pixel.accelerate(+1);
      pixel.proc(elapsed);
      crazy.draw(ctx);
      const crazy_key = crazy_get_key();
      if (crazy_key === 'jump') crazy.jump();
      if (crazy_key === 'left') crazy.accelerate(-1);
      if (crazy_key === 'right') crazy.accelerate(+1);
      crazy.proc(elapsed);
      pixel.draw(ctx);
    });

    canvas.render_slow((ctx, elapsed) => {
      platforms.forEach(e => e.draw(ctx));
      walls.forEach(e => e.draw(ctx));
      ctx.fillStyle = 'white';
      flying_figure.proc(elapsed);
      flying_figure.draw(ctx);
      box.rotate(elapsed);
      box.draw(ctx);
      ctx.fillStyle = 'white';
      px.utils.text.print(ctx, `${canvas.get_fps()}`, 5, 5);
      px.utils.text.print(ctx, 'Привет, мой воздушный мир,\nсотканный из приключений.', 30, 10);
      
    });
    */


    canvas.exec();
    

    //create a synth and connect it to the master output (your speakers)
    //var synth = new Tone.Synth().toMaster();

    //play a middle 'C' for the duration of an 8th note
    //synth.triggerAttackRelease('C4', '8n');
/*
    const synthB = new Tone.Synth({
      oscillator : {
        type : 'triangle4'
      },
      envelope : {
        attack : 0.4,
        decay : 0.3,
        sustain: 0.2,
        release: 0.2,
      },
      //volume: -0.5,
    }).toMaster();
*/
    //synthB.triggerAttack('C3');

  }


  window.addEventListener('load', onload, false);



  

})();