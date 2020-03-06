
function include(path, a) {

  let _then = _ => console.log(`Function "include(...).then" was not called properly`);

  function loadjs(src, async = true) {
    return new Promise((res, rej) =>
      document.head.appendChild(Object.assign(document.createElement('script'), {
        src,
        async,
        onload: _ => res(src),
        onerror: _ => rej(src)
      }))
    );
  }

  Promise.all(a.map(e => loadjs(path + e)))
    .then(_ => window.addEventListener('load', _then))
    .catch(src => console.log(`File "${src}" not loaded`));

  return {
    version: 20190603,
    then: f => _then = f,
  };
}
