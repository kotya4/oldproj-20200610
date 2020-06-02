// Main.
window.onload = async function Main() {
  // Sets up window properties.
  let W = window.innerWidth, H = window.innerHeight;
  window.addEventListener('resize', () => {
    W = window.innerWidth;
    H = window.innerHeight;
  });

  // Creates canvas.
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.height = 500;
  ctx.canvas.width = 500;
  ctx.imageSmoothingEnabled = false;
  document.body.appendChild(ctx.canvas);
  ctx.fillStyle = 'rgb(37, 19, 26)'; // tileset background color
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // DEBUG:
  const debug = {};
  debug.ctx = document.createElement('canvas').getContext('2d');
  debug.ctx.canvas.className = 'debug-canvas';
  debug.ctx.canvas.height = 500;
  debug.ctx.canvas.width = 500;
  debug.ctx.imageSmoothingEnabled = false;
  document.body.appendChild(debug.ctx.canvas);
  debug.ctx.font = '12px "Lucida Console", Monaco, monospace';
  debug.ctx.fillStyle = 'white';
  debug.ctx.fillText('debug layer', 0, 12);

  // Loads certain images from 'Data'.
  const images = [];
  const promises = [];
  {
    [

      'tileset.png',

    ].forEach(key => {
      images.push(new Image());
      images[images.length - 1].src = Data[key];
      promises.push(new Promise(r => images[images.length - 1].onload = r));
    });
  }
  await Promise.all(promises); // TODO: make loading screen

  // DEBUG: Helps with tileset.
  {
    new TilesetViewer(images[0], 2, [16, 16], 8, document.body);
  }


  const tiles = {
    floor_cornered: [208, 209, 210, 211,
                     169, 170, 171, 172,
                     177,           180,
                     185, 186, 187, 188],
    floor: [178, 179,
            166, 167,
            174, 175,
            182, 183,
            216, 217, 218, 219],
    wall: [],

  };

  debug.ctx.canvas.style.display = 'none';


  // Map.

  // DEBUG:
  let FLAG = 1;
  for (let INF = 0; INF < 0xff && FLAG; ++INF) {
    FLAG = false;
    debug.ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const MAP_W = 15 * 2;
    const MAP_H = 10 * 3;
    const map = Array(MAP_W).fill().map((_,x) => Array(MAP_H).fill().map((_,y) =>
      0 // void
    ));


    function draw_map(ctx) {
      for (let x = 0; x < MAP_W; ++x) {
        for (let y = 0; y < MAP_H; ++y) {
          // if (map[x][y] === 0) continue;
          // Finds tile in tileset.
          const ti = map[x][y];
          const tx = ti % 8;
          const ty = ti / 8 | 0;
          // Draws tile.
          const sw = 16;
          const sh = 16;
          const sx = tx * sw;
          const sy = ty * sh;
          const scaler = 1;
          const dw = 16 * scaler;
          const dh = 16 * scaler;
          const dx = x * dw;
          const dy = y * dh;
          ctx.drawImage(images[0], sx, sy, sw, sh, dx, dy, dw, dh);
          // Draws cells.
          // ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
          // ctx.strokeRect(dx, dy, dw, dh);
        }
      }
    }


    function get_map(x, y, err=null) {
      x = ~~x;
      y = ~~y;
      if (x < 0 || x >= MAP_W || y < 0 || y >= MAP_H) return err;
      return map[x][y];
    }


    function map_3x3(x, y, value) {
      if (null !== get_map(x-1, y-1)) map[x-1][y-1] = value;
      if (null !== get_map(x+0, y-1)) map[x+0][y-1] = value;
      if (null !== get_map(x+1, y-1)) map[x+1][y-1] = value;
      if (null !== get_map(x-1, y+0)) map[x-1][y+0] = value;
      if (null !== get_map(x+0, y+0)) map[x+0][y+0] = value;
      if (null !== get_map(x+1, y+0)) map[x+1][y+0] = value;
      if (null !== get_map(x-1, y+1)) map[x-1][y+1] = value;
      if (null !== get_map(x+0, y+1)) map[x+0][y+1] = value;
      if (null !== get_map(x+1, y+1)) map[x+1][y+1] = value;


      debug.ctx.fillStyle = 'rgb(0, 255, 0, 0.2)';
      debug.ctx.fillRect(x*32, y*32, 32, 32);
    }


    function map_straight_line(x1, y1, x2, y2, value) {
      // Bresenham 4-connected.
      const dx = Math.abs(x2 - x1);
      const dy = Math.abs(y2 - y1);
      const sx = x1 < x2 ? +1 : -1;
      const sy = y1 < y2 ? +1 : -1;
      let e = 0;
      for (let i = dx + dy + 1; i--; ) {
        if (null !== get_map(x1, y1)) map_3x3(x1, y1, value);
        const e1 = e + dy;
        const e2 = e - dx;
        if (Math.abs(e1) < Math.abs(e2)) { x1 += sx; e = e1; }
        else                             { y1 += sy; e = e2; }
      }
    }



    function map_curved_line(x1, y1, x2, y2, value, line_type) {
      // TIP: starting point always has gap to draw on top of
      // it block like door or sth.

      x1 = ~~x1;
      y1 = ~~y1;
      x2 = ~~x2;
      y2 = ~~y2;
      const dx = Math.sign(x2-x1);
      const dy = Math.sign(y2-y1);
      const w = Math.abs(x2-x1);
      const h = Math.abs(y2-y1);

      // horisontal -> vertical
      if (line_type === 'HV') {
        // h.
        for (let i = w; (i--) > 0; x1 += dx)
          if (null !== get_map(x1, y1)) map_3x3(x1, y1, value);
        // v.
        for (let i = h; (i--) >= 0; y1 += dy)
          if (null !== get_map(x1, y1)) map_3x3(x1, y1, value);
      }

      // vertical -> horisontal (can't be)
      // else if (line_type === 'VH') {
      //   // v.
      //   for (let i = h; (i--) >= 0; y1 += dy)
      //     if (null !== get_map(x1, y1)) map_3x3(x1, y1, value);
      //   // h.
      //   for (let i = w; (i--) >= 0; x1 += dx)
      //     if (null !== get_map(x1, y1)) map_3x3(x1, y1, value);
      // }

      // horisontal -> vertical -> horisontal
      else if (line_type === 'HVH') {
        const a = Math.max(0, Math.random()*(w-2)+1|0);
        const b = w - a;
        // half h.
        for (let i = a; (i--) >= 0; x1 += dx)
          if (null !== get_map(x1, y1)) map_3x3(x1, y1, value);
        // v.
        for (let i = h; (i--) > 0; y1 += dy)
          if (null !== get_map(x1, y1)) map_3x3(x1, y1, value);
        // h.
        for (let i = b; (i--) > 0; x1 += dx)
          if (null !== get_map(x1, y1)) map_3x3(x1, y1, value);
      }

      // vertical -> horisontal -> vertical
      else if (line_type === 'VHV') {
        const a = Math.max(0, Math.random()*(h-2)+1|0);
        const b = h - a;
        // half v.
        for (let i = a; (i--) >= 0; y1 += dy)
          if (null !== get_map(x1, y1)) map_3x3(x1, y1, value);
        // h.
        for (let i = w; (i--) > 0; x1 += dx)
          if (null !== get_map(x1, y1)) map_3x3(x1, y1, value);
        // v.
        for (let i = b; (i--) > 0; y1 += dy)
          if (null !== get_map(x1, y1)) map_3x3(x1, y1, value);
      }

      else {
        throw Error(`map_curved_line:: line_type cannot be "${line_type}"`);
      }

      console.log(line_type);

    }



    // Generates room.
    // Algorithm uses 0 as void, 1 as room, so before calling it be
    // sure that map filled with zeros.
    {
      const RECTS_NUM_MIN = 5;
      const RECTS_NUM_MAX = 9;
      const RECT_W_MIN = 5;
      const RECT_W_MAX = 7;
      const RECT_H_MIN = 5;
      const RECT_H_MAX = 6;
      const num = Math.random()*(RECTS_NUM_MAX-RECTS_NUM_MIN)+RECTS_NUM_MIN|0;

      const rects = [];
      const potential_doors = []; // if there walls still existing then you can
                                  // put door in there "[x, y]".

      // It would've be soooo easy to generate room if I decide to  pevent
      // rectangles from connecting each other, and 'grow' connections  on
      // top of existing rectangles, overall make first step of generation
      // more intelligent than total randomness (as how it now). I thought
      // it would be simple but in next stages of generating it becomes  a
      // lot more difficult......(~ =_=)~

      // Cuts out the room by randomly throwing randomly sized rectangles
      // all over the place.
      for (let i = 0; i < num; ++i) {
        const X = Math.random() * (MAP_W - RECT_W_MAX - 0) + 1 | 0;
        const Y = Math.random() * (MAP_H - RECT_H_MAX - 0) + 1 | 0;
        const W = Math.random() * (RECT_W_MAX - RECT_W_MIN) + RECT_W_MIN | 0;
        const H = Math.random() * (RECT_H_MAX - RECT_H_MIN) + RECT_H_MIN | 0;
        const center = [X+W/2, Y+H/2];
        // Saves rectangle for further use.
        rects.push({ X, Y, W, H, center });
        // Fills rectangle with 'room' identifier.
        for (let x = 0; x < W; ++x)
          for (let y = 0; y < H; ++y)
            map[X+x][Y+y] = 1;

        // Each rectangle must be aviable from another rectangles.
        // It means I have to  connect  all  rectangles  together.

        if (i === 0) continue; // No need to check single rectangle.

        // Searching for the nearest to the current rectangle.
        let near = null, near_i = -1, near_dist = Infinity;
        for (let k = 0; k < i; ++k) {
          const dist = Math.hypot(...rects[k].center.map((e,i) => center[i]-e));
          if (near_dist > dist) {
            near = rects[k];
            near_i = k;
            near_dist = dist;
          }
        }

        debug.ctx.strokeStyle = debug.ctx.fillStyle = 'yellow';
        debug.ctx.fillText(i, ...center.map(e => e * 16 * 2));
        debug.ctx.fillText(near_i, ...rects[near_i].center.map(e => e * 16 * 2));
        // debug.ctx.beginPath();
        // debug.ctx.moveTo(...rects[near_i].center.map(e => e * 16 * 2));
        // debug.ctx.lineTo(...center.map(e => e * 16 * 2));
        // debug.ctx.stroke();

        // Current rectange corners.
        const cx1 = X;
        const cx2 = X+W-1;
        const cy1 = Y;
        const cy2 = Y+H-1;
        // Nearest rectange corners.
        const nx1 = near.X;
        const nx2 = near.X+near.W-1;
        const ny1 = near.Y;
        const ny2 = near.Y+near.H-1;

        // Are rectangles nested with each other?
        if ((nx1 <= cx1 && cx1 <= nx2 && ny1 <= cy1 && cy1 <= ny2)
        ||  (nx1 <= cx2 && cx2 <= nx2 && ny1 <= cy1 && cy1 <= ny2)
        ||  (nx1 <= cx1 && cx1 <= nx2 && ny1 <= cy2 && cy2 <= ny2)
        ||  (nx1 <= cx2 && cx2 <= nx2 && ny1 <= cy2 && cy2 <= ny2))
        {
          // Yes, they are nested (potentially connected), but I need  to  run
          // ~dirty~ method  that  checks  rectangles  for  corner  connection
          // (rectangles are separated by walls but reacts as they connected),
          // and if so, draws between them ~ugly~ path, ugh. Btw path is a 5x3
          // cutup with problematic corner as the center.

          debug.ctx.fillText('IN', 10+center[0]*32, center[1]*32);

          let dist;

          // Current rectangle upper than nearest.
          if (ny1+0 === cy2 || ny1+1 === cy2) {
            // Compares current bottom-left and nearest top-right corners.
            dist = (nx2 - cx1);
            if (dist === 0 || dist === 1)
              for (let x = -2; x <= +2; ++x)
                for (let y = -1; y <= +1; ++y)
                  map[cx1+x][ny1+y] = 1;
            // Compares current bottom-right and nearest top-left corners.
            dist = (cx2 - nx1);
            if (dist === 0 || dist === 1)
              for (let x = -2; x <= +2; ++x)
               for (let y = -1; y <= +1; ++y)
                 map[nx1+x][ny1+y] = 1;
          }
          // Current rectangle downer than nearest.
          if (cy1+0 === ny2 || cy1+1 === ny2) {
            // Compares current top-left and nearest bottom-right corners.
            dist = (nx2 - cx1);
            if (dist === 0 || dist === 1)
              for (let x = -2; x <= +2; ++x)
                for (let y = -1; y <= +1; ++y)
                  map[cx1+x][cy1+y] = 1;
            // Compares current top-right and nearest bottom-left corners.
            dist = (cx2 - nx1);
            if (dist === 0 || dist === 1)
              for (let x = -2; x <= +2; ++x)
                for (let y = -1; y <= +1; ++y)
                  map[nx1+x][cy1+y] = 1;
          }
        } else {
          // No, rectangles are separated, so I must connect them.

          debug.ctx.fillText('OUT', 10+center[0]*32, center[1]*32);

          FLAG = false;

          const lefter = cx2 <= nx1;
          const righter = cx1 >= nx2;
          const higher = cy2 <= ny1;
          const lower = cy1 >= ny2;


          if (lefter) debug.ctx.fillText('lefter', center[0]*32, center[1]*32+12*1);
          if (righter) debug.ctx.fillText('righter', center[0]*32, center[1]*32+12*2);
          if (lower) debug.ctx.fillText('lower', center[0]*32, center[1]*32+12*3);
          if (higher) debug.ctx.fillText('higher', center[0]*32, center[1]*32+12*4);


          // 'From' point.
          let fx = X + Math.random()*(W-2)+1|0;
          let fy = Y + Math.random()*(H-2)+1|0;
          if (lefter || righter) {
            /**/ if (lefter)  { fx = cx2; }
            else if (righter) { fx = cx1; }
          } else {
            /**/ if (lower)  { fy = cy1; }
            else if (higher) { fy = cy2; }
          }
          // 'To' point.
          let tx = near.X + Math.random()*(near.W-2)+1|0;
          let ty = near.Y + Math.random()*(near.H-2)+1|0;
          if (lower || higher) {
            /**/ if (lower)  { ty = ny2; }
            else if (higher) { ty = ny1; }
          } else {
            /**/ if (lefter)  { tx = nx1; }
            else if (righter) { tx = nx2; }
          }


          debug.ctx.strokeStyle = 'blue';
          debug.ctx.strokeRect(fx*32, fy*32, 32, 32);

          debug.ctx.strokeStyle = 'red';
          debug.ctx.strokeRect(tx*32, ty*32, 32, 32);


          // Drawing line between them.


          // has to be 2 or (3 can't be because current rectangle
          // always chooses horisontal over vertical, so starting
          // point of line whould be horisontal)
          if ((lefter || righter) && (lower || higher)) {
            map_curved_line(fx, fy, tx, ty, 1, 'HV');
          }

          else if (lefter || righter) {
            map_curved_line(fx, fy, tx, ty, 1, 'HVH');
          }

          else if (lower || higher) {
            map_curved_line(fx, fy, tx, ty, 1, 'VHV');
          }

          else {
            console.log('WTF');
          }

          potential_doors.push([fx, fy]);



        }









      }

      // Overcomplicated algorithm that sets proper tiles for walls and floor.
      for (let x = 0; x < MAP_W; ++x) {
        for (let y = 0; y < MAP_H; ++y) {

          if (map[x][y] === 0) continue; // Skip the void.

          // 8 sides of current block excluding middle one (current block itself).
          const hash =
            (!!get_map(x-1, y-1, 0)) << 7 | // TL
            (!!get_map(x  , y-1, 0)) << 6 | // TM
            (!!get_map(x+1, y-1, 0)) << 5 | // TR
            (!!get_map(x-1, y  , 0)) << 4 | // ML
            // MM isn't here btw.
            (!!get_map(x+1, y  , 0)) << 3 | // MR
            (!!get_map(x-1, y+1, 0)) << 2 | // BL
            (!!get_map(x  , y+1, 0)) << 1 | // BM
            (!!get_map(x+1, y+1, 0)) << 0 ; // BR

          // Number of hashes for "mirroring walls" (f.e. top-left corner and top-right
          // corner  or  middle-left  side  and  middle-right  side)  should  be equal.
          // There are 256 variants of walls placement, but not all of them  works with
          // given  tileset,  so  no  need to think about all 256 of them (idk how many
          // exactly,   I'd   brutforced   variants    by    hand   with   randomizer).

          // Top-left corner and middle-left side.
          //             TTTMMBBB
          if (hash === 0b00001011
          ||  hash === 0b01101011
          ||  hash === 0b00001111
          ||  hash === 0b01101111
          ||  hash === 0b11101011
          ||  hash === 0b00101011
          ||  hash === 0b00101111
          ||  hash === 0b10001111
          ||  hash === 0b11101111
          ||  hash === 0b11001111
          ||  hash === 0b10111011
          ||  hash === 0b10011011
          ||  hash === 0b10001011
          ||  hash === 0b11001011
          ||  hash === 0b10101011
          ||  hash === 0b10101111)
          { // c|-, |>
            map[x][y] = 160;
          }
          // Top-right corner and middle-right side.
          //             TTTMMBBB
          if (hash === 0b00010110
          ||  hash === 0b11010110
          ||  hash === 0b11110110
          ||  hash === 0b10010110
          ||  hash === 0b00010111
          ||  hash === 0b11010111
          ||  hash === 0b10010111
          ||  hash === 0b00111110
          ||  hash === 0b10110110
          ||  hash === 0b11110111
          ||  hash === 0b00110110
          ||  hash === 0b01110110
          ||  hash === 0b00110111
          ||  hash === 0b01110111
          ||  hash === 0b10110111
          ||  hash === 0b10111110)
          { // c-|, <|
            map[x][y] = 165;
          }
          // Bottom-left corner.
          //             TTTMMBBB
          if (hash === 0b01101000
          ||  hash === 0b11101000
          ||  hash === 0b01101001
          ||  hash === 0b11101001
          ||  hash === 0b01111100
          ||  hash === 0b11101101
          ||  hash === 0b01101100
          ||  hash === 0b01101101
          ||  hash === 0b11101100
          ||  hash === 0b11101110
          ||  hash === 0b01111101
          ||  hash === 0b01101110)
          { // c|_
            map[x][y] = 192;
          }
          // Bottom-right corner.
          //             TTTMMBBB
          if (hash === 0b11010000
          ||  hash === 0b11110000
          ||  hash === 0b11010100
          ||  hash === 0b11110100
          ||  hash === 0b11110100
          ||  hash === 0b11110001
          ||  hash === 0b11110011
          ||  hash === 0b11011001
          ||  hash === 0b11011101
          ||  hash === 0b11010101
          ||  hash === 0b11010011
          ||  hash === 0b11010001
          ||  hash === 0b11110101)
          { // c_|
            map[x][y] = 197;
          }
          // Middle-top side.
          //             TTTMMBBB
          if (hash === 0b00011111
          ||  hash === 0b00111111
          ||  hash === 0b01111111
          ||  hash === 0b11011111
          ||  hash === 0b10011111
          ||  hash === 0b10111111)
          { // v-
            map[x][y] = 161;
          }
          // Middle-bottom side.
          //             TTTMMBBB
          if (hash === 0b11111000
          ||  hash === 0b11111100
          ||  hash === 0b11111001
          ||  hash === 0b11111101)
          { // ^_
            map[x][y] = 196;
          }
          // Bottom-left outter corner.
          //             TTTMMBBB
          if (hash === 0b11111110
          ||  hash === 0b01111110)
          { // BL |-
            map[x][y] = 204;
          }
          // Bottom-right outter corner.
          //             TTTMMBBB
          if (hash === 0b11111011
          ||  hash === 0b11011011)
          { // BR -|
            map[x][y] = 203;
          }
          // Any floor.
          //             TTTMMBBB
          if (hash === 0b11111111)
          {
            map[x][y] = 178;
          }

          // TODO: Add randomized tiles.
          // TODO: Add floor types.

          // DEBUG: If 'bad' block found then print me a message.
          if (map[x][y] === 1) {
            let hash_str = hash.toString(2);
            hash_str = '0'.repeat(8 - hash_str.length) + hash_str;
            const style = 'background:red';
            console.log(`%cUncovered hash: ${hash_str}`, style);
            console.log(`%c${[(hash>>7)&1,(hash>>6)&1,(hash>>5)&1].join('')}`, style);
            console.log(`%c${[(hash>>4)&1,   '?'     ,(hash>>3)&1].join('')}`, style);
            console.log(`%c${[(hash>>2)&1,(hash>>1)&1,(hash>>0)&1].join('')}`, style);
          }
        }
      }

      // Fills all the void with proper tile.
      for (let x = 0; x < MAP_W; ++x)
        for (let y = 0; y < MAP_H; ++y)
          if (map[x][y] === 0)
            map[x][y] = 255;
    }

  }



  console.log({ FLAG });


  draw_map(ctx);





  ctx.font = '80px "Lucida Console", Monaco, monospace';
  ctx.strokeStyle = 'blue';
  ctx.fillStyle = 'white';
  ctx.fillText('FINALLY!!!', 10, 200);
  ctx.strokeText('FINALLY!!!', 10, 200);













}
