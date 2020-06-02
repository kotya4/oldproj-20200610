
  // Generates room.
  // TIP: I thought this method would be less complicated (it not),
  //      use brutforce vertion instead.
  /*
  {
    const ROOMS_NUM = [1, 5]; // min, max
    const ROOM_RECT = [5, 5, 5, 5]; // min width, max width, min height, max height

    const num = Math.random() * (ROOMS_NUM[1] - ROOMS_NUM[0]) + ROOMS_NUM[0] | 0;

    const TOP = 161;
    const BOT = 194;
    const LEF = 168;
    const RIG = 173;
    const FLO = 178;

    function is_wall(i) { return i !== 0 && i !== FLO; }
    function is_floor(i) { return i === FLO; }
    function is_void(i) { return i === 0; }

    for (let i = 0; i < 6; ++i) {
      const X = Math.random() * (MAP_W - ROOM_RECT[1]) + 1 | 0;
      const Y = Math.random() * (MAP_H - ROOM_RECT[3]) + 1 | 0;
      const W = Math.random() * (ROOM_RECT[1] - ROOM_RECT[0]) + ROOM_RECT[0] | 0;
      const H = Math.random() * (ROOM_RECT[3] - ROOM_RECT[2]) + ROOM_RECT[2] | 0;
      // Filling inner rect with floor.
      for (let x = 1; x < W-1; ++x) {
        for (let y = 1; y < H-1; ++y) {
          map[X+x][Y+y] = FLO;
        }
      }
      // Stroking borders with walls if there no floor.
      for (let x = 0; x < W; ++x) {
        if (map[X+x][Y+0-0] !== FLO) map[X+x][Y+0-0] = TOP;
        if (map[X+x][Y+H-1] !== FLO) map[X+x][Y+H-1] = BOT;
      }
      for (let y = 0; y < H; ++y) {
        if (map[X+0-0][Y+y] !== FLO) map[X+0-0][Y+y] = LEF;
        if (map[X+W-1][Y+y] !== FLO) map[X+W-1][Y+y] = RIG;
      }
    }


    for (let x = 0; x < MAP_W; ++x) {
      for (let y = 0; y < MAP_H; ++y) {

        const TL = get_map(x-1, y-1, 0);
        const TM = get_map(x  , y-1, 0);
        const TR = get_map(x+1, y-1, 0);
        const ML = get_map(x-1, y  , 0);
        const MM = get_map(x  , y  , 0);
        const MR = get_map(x+1, y  , 0);
        const BL = get_map(x-1, y+1, 0);
        const BM = get_map(x  , y+1, 0);
        const BR = get_map(x+1, y+1, 0);


        if (is_wall(MM)) {

          // Wall cannot intersect room vertically.
          if (is_floor(ML) && is_floor(MR)) {
            map[x][y] = FLO;
          }

          // Wall can intersect room horisontally.
          if (is_floor(TM) && is_floor(BM)) {
            map[x][y] = TOP;
          }


          if (is_void(TM) && is_wall(ML) && is_wall(MR)) {
            map[x][y] = TOP;
          }


          if (is_void(BM) && is_wall(ML) && is_wall(MR)) {
            map[x][y] = BOT;
          }
        }
      }
    }
  }
  */


