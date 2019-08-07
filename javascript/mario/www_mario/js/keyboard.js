function Keyboard() {
  const keys = [];
  let repeats = false;

  function set_key(e, pressed) {

  }

  window.addEventListener('keydown', e => keys[e.keyCode] = true);
  window.addEventListener('keyup', e => keys[e.keyCode] = false);

}
