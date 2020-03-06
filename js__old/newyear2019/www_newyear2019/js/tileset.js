function Tileset(size, path, ...a) {
  
  const tileset = {
    size,
    data: {},
    get: function (name) { return this.data[name] },
  };

  function load(name, src, sizes) {
    return new Promise((res, rej) => {
      tileset.data[name] = {
        sizes,
        name,
        img: Object.assign(new Image(), {
          onerror: () => console.log(`in tileset "${src}" not loaded`),
          onload: () => res(tileset),
          src,
        })
      }
    })
  }

  return Promise.all(a.map(e => load(
    // name
    e[0].slice(0, e[0].lastIndexOf('.png')).replace(/\//g, '_'),
    // full path
    `${path}${e[0]}`,
    // sizes of single tile ("size" by default)
    e.length > 1 ? e[1] : [size, size]
  )));
}