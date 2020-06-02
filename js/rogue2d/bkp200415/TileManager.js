//
function TileManager(opt) {
  const tilesize = opt.tilesize;  // ("MapManager" accesses).
  const tiles = opt.tiles;

  // Любая идея менее безумна чем реальность.

  tiles[-1] = {
    solid: true,

  };








  return {

    tilesize,
    // functions
    get,

  };


  function get(i) {
    return tiles[i];
  }




  // function




}








// tm --- TextureManager
// num --- Tiles number
TileManager.generators = [


  function(tm, num) {
    if (!tm.ready()) console.log('TileManager.generators:: TextureManager was not ready!');
    return [
      tm.clear().composition,
      Array(num-1).fill().map(_ =>
        tm.compose_with({ operation: 'source-over', alpha: 1.0, filter: { hue:   0 } })
          .compose_with({ operation: 'source-over', alpha: 0.5, filter: { hue: 100 } })
      ).composition,
    ];
  },


];
