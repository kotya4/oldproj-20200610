
function Keyboard() {
  let keys = {};
  let last = null;
  window.addEventListener('keydown', e => keys[(last = e.keyCode)] = true);
  window.addEventListener('keyup', e => keys[e.keyCode] = false);
  return {
    pressed: k => k in keys && true === keys[k],
    last: () => last
  }
}