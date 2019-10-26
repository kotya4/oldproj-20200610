var DEBUG = {};

window.onload = async () => {
  const display_height = 300;
  const display_width = 640;

  const ctx = document.createElement('canvas').getContext('2d');
  document.body.appendChild(ctx.canvas);
  ctx.canvas.height = display_height + 192;
  ctx.canvas.width = display_width + 100;
  ctx.imageSmoothingEnabled = false;

  const debugdiv = document.createElement('div');
  document.body.appendChild(debugdiv);
  DEBUG.div = debugdiv;

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
  const fixedsys = await Fixedsys8x12(80, 25);
  lines.forEach(e => fixedsys.liner.stroke(...e));
  fixedsys.screen.flush(ctx);

  // const fixedsys = await Fixedsys8x12(80, 25);
  // const ox = Math.random() * 100 + 100;
  // const oy = Math.random() * 50 + 100;
  // window.onmousemove = (e) => {
  //   fixedsys.screen.clear();
  //   fixedsys.liner.stroke(ox, oy, e.clientX, e.clientY);
  // };
  // setInterval(() => {
  //   ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  //   fixedsys.screen.flush(ctx);
  // }, 100);




  // console.time('time2');
  // lines.forEach(e => fixedsys.liner.stroke(...e));
  // console.timeEnd('time2');

  // fixedsys.screen.flush(ctx);


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
