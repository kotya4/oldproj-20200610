
window.onload = async () => {
  const display_height = 300;
  const display_width = 640;

  const ctx = document.createElement('canvas').getContext('2d');
  document.body.appendChild(ctx.canvas);
  ctx.canvas.height = display_height + 192;
  ctx.canvas.width = display_width + 100;
  ctx.imageSmoothingEnabled = false;

  // draw random lines
  const lines = [];
  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; ++i) {
    const points_x = [0, 0].map(_ => Math.random() * display_width);
    const points_y = [0, 0].map(_ => Math.random() * display_height);
    lines.push([points_x[0], points_y[0], points_x[1], points_y[1]]);
    ctx.beginPath();
    ctx.moveTo(points_x[0], points_y[0]);
    ctx.lineTo(points_x[1], points_y[1]);
    //ctx.stroke();
  }

  // fixedsys.screen.buffer.forEach(e => e.char_index = Math.random() * 256 | 0);

  // lines.forEach(e => fixedsys.liner.stroke(e));

  const fixedsys = await Fixedsys8x12(80, 25);

  // window.onmousemove = (e) => {
  //   ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  //   fixedsys.screen.clear();
  //   fixedsys.liner.stroke(100, 100, e.clientX, e.clientY);
  //   fixedsys.screen.flush(ctx);
  // };

  console.time('time2');
  lines.forEach(e => fixedsys.liner.stroke(...e));
  console.timeEnd('time2');

  fixedsys.screen.flush(ctx);


  // symbolize

  // const ascii = await Symbolyzer.create_ascii_table(BASE64__ascii);
  // const chset = Symbolyzer.create_charset(ascii);

  // console.time('time2');

  // Symbolyzer.symbolize(ascii, chset, ctx, 0, 0, display_width, display_height, 30);

  // console.timeEnd('time2');

}

/*

    /
   /
  /
 /    /
/   .`
   /     /
 .`     /
/     .`
     /
    /
  .`
 /
/


|
|
|
|


|
 :
 |
  :
  |
   :
   |
_
 '-_
    '-_
       '-_


 -.,
    `"-.,
         `"-.,
              `"-.,


\
 ",
   \
    ",
      \

\
 \
  \
   \
    \
     \
      \
       \
        \


:
 ;
  \
   :
    ;
     \
      :
       ;
        \
         :

        _
    _.-'
_.-'

                            ________
______....-------''''''`````

______________________________


------------------------------


_,.-~'"`
*/
