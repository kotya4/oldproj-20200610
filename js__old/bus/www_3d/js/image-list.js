
function ImageList() {
  const images = {};

  function load(path, list) {
    return Promise.all(list.map(p => new Promise((res, rej) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = path + p;
      img.onload = () => res();
      img.onerror = () => rej(p);
      images[p.replace(/\//g, '_').substr(0, p.lastIndexOf('.'))] = img;
    })));
  }

  function map(func) {
    let o = {};
    for (let key in images) o[key] = func(images[key], key, images);
    return o;
  }

  return {
    images,
    load,
    map,
  }
}
