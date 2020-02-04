//
function scriptloader() {
  return {
    include(path, a) {
      let _then = _ => console.log(`scriptloader :: 'then' not provided`);

      const loadscript = (src, async = true) => new Promise((res, rej) =>
        document.head.appendChild(Object.assign(document.createElement('script'), {
          src,
          async,
          onload: _ => res(src),
          onerror: _ => rej(src)
      })));

      Promise.all(a.map(e => loadscript(path + e)))
        .then(_ => window.addEventListener('load', _then))
        .catch(src => console.log(`scriptloader :: File "${src}" not loaded`));

      return { then: f => _then = f }
    }
  }
}
